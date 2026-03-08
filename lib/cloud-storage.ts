import { createServiceClient } from '@/lib/supabase'

type Provider = 'google_drive' | 'dropbox' | 'onedrive'

interface TokenRow {
  id: string
  user_id: string
  provider: string
  access_token: string
  refresh_token: string | null
  token_expiry: string | null
  account_email: string | null
  account_name: string | null
  updated_at: string
}

const REFRESH_CONFIGS: Record<Provider, {
  tokenUrl: string
  clientIdEnv: string
  clientSecretEnv: string
}> = {
  google_drive: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  dropbox: {
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    clientIdEnv: 'DROPBOX_CLIENT_ID',
    clientSecretEnv: 'DROPBOX_CLIENT_SECRET',
  },
  onedrive: {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientIdEnv: 'ONEDRIVE_CLIENT_ID',
    clientSecretEnv: 'ONEDRIVE_CLIENT_SECRET',
  },
}

/**
 * Get a valid access token for a user + provider.
 * Auto-refreshes expired tokens.
 */
export async function getValidAccessToken(userId: string, provider: Provider): Promise<string> {
  const supabase = createServiceClient()

  const { data: row, error } = await supabase
    .from('user_cloud_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (error || !row) {
    throw new Error(`${provider} not connected for this user`)
  }

  const token = row as TokenRow

  // If token is still valid (with 60s buffer), return it
  if (token.token_expiry && new Date(token.token_expiry).getTime() > Date.now() + 60_000) {
    return token.access_token
  }

  // If no refresh token, return current token (some providers don't expire)
  if (!token.refresh_token) {
    return token.access_token
  }

  // Refresh the token
  const config = REFRESH_CONFIGS[provider]
  const clientId = process.env[config.clientIdEnv]
  const clientSecret = process.env[config.clientSecretEnv]

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${provider} credentials`)
  }

  const body: Record<string, string> = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  }

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Failed to refresh ${provider} token: ${errBody}`)
  }

  const data = await res.json()
  const newExpiry = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : token.token_expiry

  const updates: Record<string, string> = {
    access_token: data.access_token,
    updated_at: new Date().toISOString(),
  }
  if (newExpiry) updates.token_expiry = newExpiry
  // Some providers rotate refresh tokens
  if (data.refresh_token) updates.refresh_token = data.refresh_token

  await supabase
    .from('user_cloud_tokens')
    .update(updates)
    .eq('user_id', userId)
    .eq('provider', provider)

  return data.access_token
}

/**
 * Revoke access and delete stored tokens for a provider.
 */
export async function revokeAccess(userId: string, provider: Provider): Promise<void> {
  const supabase = createServiceClient()

  const { data: row } = await supabase
    .from('user_cloud_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (row) {
    // Best-effort revoke
    if (provider === 'google_drive') {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${row.access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).catch(() => {})
    } else if (provider === 'dropbox') {
      await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${row.access_token}` },
      }).catch(() => {})
    }
    // OneDrive/Microsoft doesn't support programmatic revoke

    await supabase
      .from('user_cloud_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider)
  }
}

/**
 * Check if a user has a specific provider connected.
 */
export async function getConnectionStatus(userId: string, provider: Provider): Promise<{
  connected: boolean
  email: string | null
  name: string | null
}> {
  const supabase = createServiceClient()

  const { data: row } = await supabase
    .from('user_cloud_tokens')
    .select('account_email, account_name')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  return {
    connected: !!row,
    email: row?.account_email || null,
    name: row?.account_name || null,
  }
}

/**
 * Detect file type from MIME type.
 */
export function detectFileType(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('document') || mimeType.includes('text')) return 'document'
  return 'other'
}

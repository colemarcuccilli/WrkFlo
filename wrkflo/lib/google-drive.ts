import { createServiceClient } from '@/lib/supabase'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

interface DriveTokenRow {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  token_expiry: string
  google_email: string | null
}

/**
 * Get a valid Google Drive access token for a user.
 * Refreshes automatically if expired.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const supabase = createServiceClient()

  const { data: row, error } = await supabase
    .from('user_drive_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !row) {
    throw new Error('Google Drive not connected for this user')
  }

  const token = row as DriveTokenRow

  // If token is still valid (with 60s buffer), return it
  if (new Date(token.token_expiry).getTime() > Date.now() + 60_000) {
    return token.access_token
  }

  // Refresh the token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to refresh Google token: ${body}`)
  }

  const data = await res.json()
  const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabase
    .from('user_drive_tokens')
    .update({
      access_token: data.access_token,
      token_expiry: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return data.access_token
}

/**
 * Revoke Google Drive access and delete stored tokens.
 */
export async function revokeAccess(userId: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: row } = await supabase
    .from('user_drive_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single()

  if (row) {
    // Best-effort revoke with Google
    await fetch(`https://oauth2.googleapis.com/revoke?token=${row.access_token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).catch(() => {})

    await supabase
      .from('user_drive_tokens')
      .delete()
      .eq('user_id', userId)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const userId = req.nextUrl.searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/settings?onedrive=error', req.url))
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.ONEDRIVE_CLIENT_ID!,
        client_secret: process.env.ONEDRIVE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/onedrive/callback`,
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('OneDrive token exchange failed:', errBody)
      return NextResponse.redirect(new URL('/settings?onedrive=error', req.url))
    }

    const tokens = await tokenRes.json()
    const expiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    // Get Microsoft profile
    let accountEmail: string | null = null
    let accountName: string | null = null
    try {
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (profileRes.ok) {
        const profile = await profileRes.json()
        accountEmail = profile.mail || profile.userPrincipalName || null
        accountName = profile.displayName || null
      }
    } catch {
      // Non-critical
    }

    // Upsert tokens
    const supabase = createServiceClient()
    const { error: dbError } = await supabase
      .from('user_cloud_tokens')
      .upsert({
        user_id: userId,
        provider: 'onedrive',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expiry: expiry,
        account_email: accountEmail,
        account_name: accountName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })

    if (dbError) {
      console.error('Failed to store OneDrive tokens:', dbError.message)
      return NextResponse.redirect(new URL('/settings?onedrive=error', req.url))
    }

    return NextResponse.redirect(new URL('/settings?onedrive=connected', req.url))
  } catch (err: any) {
    console.error('OneDrive callback error:', err)
    return NextResponse.redirect(new URL('/settings?onedrive=error', req.url))
  }
}

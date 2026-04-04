import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const userId = req.nextUrl.searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/settings?dropbox=error', req.url))
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.DROPBOX_CLIENT_ID!,
        client_secret: process.env.DROPBOX_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/dropbox/callback`,
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('Dropbox token exchange failed:', errBody)
      return NextResponse.redirect(new URL('/settings?dropbox=error', req.url))
    }

    const tokens = await tokenRes.json()
    const expiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    // Get Dropbox account info
    let accountEmail: string | null = null
    let accountName: string | null = null
    try {
      const accountRes = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (accountRes.ok) {
        const account = await accountRes.json()
        accountEmail = account.email || null
        accountName = account.name?.display_name || null
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
        provider: 'dropbox',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expiry: expiry,
        account_email: accountEmail,
        account_name: accountName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })

    if (dbError) {
      console.error('Failed to store Dropbox tokens:', dbError.message)
      return NextResponse.redirect(new URL('/settings?dropbox=error', req.url))
    }

    return NextResponse.redirect(new URL('/settings?dropbox=connected', req.url))
  } catch (err: any) {
    console.error('Dropbox callback error:', err)
    return NextResponse.redirect(new URL('/settings?dropbox=error', req.url))
  }
}

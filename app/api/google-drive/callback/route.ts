import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const userId = req.nextUrl.searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/settings?drive=error', req.url))
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/google-drive/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('Google token exchange failed:', errBody)
      return NextResponse.redirect(new URL('/settings?drive=error', req.url))
    }

    const tokens = await tokenRes.json()
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Get Google email from userinfo
    let googleEmail: string | null = null
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json()
        googleEmail = userInfo.email || null
      }
    } catch {
      // Non-critical
    }

    // Upsert tokens into unified cloud tokens table
    const supabase = createServiceClient()
    const { error: dbError } = await supabase
      .from('user_cloud_tokens')
      .upsert({
        user_id: userId,
        provider: 'google_drive',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: expiry,
        account_email: googleEmail,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })

    if (dbError) {
      console.error('Failed to store Drive tokens:', dbError.message)
      return NextResponse.redirect(new URL('/settings?drive=error', req.url))
    }

    return NextResponse.redirect(new URL('/settings?drive=connected', req.url))
  } catch (err: any) {
    console.error('Google Drive callback error:', err)
    return NextResponse.redirect(new URL('/settings?drive=error', req.url))
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = new URLSearchParams({
    client_id: process.env.DROPBOX_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/dropbox/callback`,
    response_type: 'code',
    token_access_type: 'offline',
    state: user.id,
  })

  return NextResponse.redirect(`https://www.dropbox.com/oauth2/authorize?${params.toString()}`)
}

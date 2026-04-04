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
    client_id: process.env.ONEDRIVE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/onedrive/callback`,
    response_type: 'code',
    scope: 'Files.Read offline_access User.Read',
    state: user.id,
  })

  return NextResponse.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`)
}

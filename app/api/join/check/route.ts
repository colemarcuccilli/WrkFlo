import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = "force-dynamic"

// Check if an email has a pending beta invite or client invite
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ invited: false })
  }

  const supabase = createServiceClient()
  const normalizedEmail = email.toLowerCase().trim()

  const { data: betaInvite } = await supabase
    .from('beta_invites')
    .select('id')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  const { data: clientInvite } = await supabase
    .from('creator_clients')
    .select('id')
    .ilike('client_email', normalizedEmail)
    .in('status', ['pending', 'active'])
    .maybeSingle()

  return NextResponse.json({
    invited: !!betaInvite || !!clientInvite,
    isBeta: !!betaInvite,
    isClient: !!clientInvite && !betaInvite,
  })
}

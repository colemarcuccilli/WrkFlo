import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Check if user has a beta invite — they should be creator, not client
  const normalizedEmail = (user.email || '').toLowerCase().trim()
  const { data: betaInvite } = await supabase
    .from('beta_invites')
    .select('id')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Beta invitees get creator role, others get client (never downgrade creator)
  if (betaInvite && profile?.role !== 'creator') {
    await supabase
      .from('users')
      .update({ role: 'creator' })
      .eq('id', user.id)
    // Mark beta invite as used
    await supabase
      .from('beta_invites')
      .update({ status: 'accepted', used: true, used_by: normalizedEmail, used_at: new Date().toISOString() })
      .ilike('email', normalizedEmail)
  } else if (!betaInvite && profile?.role !== 'creator') {
    await supabase
      .from('users')
      .update({ role: 'client' })
      .eq('id', user.id)
  }

  // Find all pending invites for this email and activate them
  const { data: pendingInvites } = await supabase
    .from('creator_clients')
    .select('*')
    .eq('client_email', user.email)
    .eq('status', 'pending')

  if (pendingInvites && pendingInvites.length > 0) {
    for (const invite of pendingInvites) {
      await supabase
        .from('creator_clients')
        .update({ client_id: user.id, status: 'active' })
        .eq('id', invite.id)
    }
  }

  return NextResponse.json({ ok: true, activated: pendingInvites?.length || 0 })
}

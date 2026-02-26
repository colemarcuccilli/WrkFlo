import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Ensure user record has client role
  await supabase
    .from('users')
    .update({ role: 'client' })
    .eq('id', user.id)

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

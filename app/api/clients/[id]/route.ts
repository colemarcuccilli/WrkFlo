import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify this is the creator's client
  const { data: clientRecord } = await supabase
    .from('creator_clients')
    .select('*')
    .eq('id', params.id)
    .eq('creator_id', user.id)
    .single()

  if (!clientRecord) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Remove all project access for this client
  if (clientRecord.client_id) {
    await supabase
      .from('client_project_access')
      .delete()
      .eq('client_id', clientRecord.client_id)
      .eq('granted_by', user.id)
  }

  // Set status to revoked
  const { error } = await supabase
    .from('creator_clients')
    .update({ status: 'revoked' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

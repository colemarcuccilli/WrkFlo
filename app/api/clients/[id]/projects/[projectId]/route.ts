import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify this is the creator's client
  const { data: clientRecord } = await supabase
    .from('creator_clients')
    .select('client_id')
    .eq('id', params.id)
    .eq('creator_id', user.id)
    .single()

  if (!clientRecord || !clientRecord.client_id) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('client_project_access')
    .delete()
    .eq('client_id', clientRecord.client_id)
    .eq('project_id', params.projectId)
    .eq('granted_by', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

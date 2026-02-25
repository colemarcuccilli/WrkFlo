import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'Client not found or not yet registered' }, { status: 404 })
  }

  // Get projects assigned to this client
  const { data, error } = await supabase
    .from('client_project_access')
    .select('project_id, projects(id, name, status, client_name, updated_at)')
    .eq('client_id', clientRecord.client_id)
    .eq('granted_by', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const body = await req.json()
  const { project_id } = body

  if (!project_id) return NextResponse.json({ error: 'project_id is required' }, { status: 400 })

  // Verify this is the creator's client
  const { data: clientRecord } = await supabase
    .from('creator_clients')
    .select('client_id')
    .eq('id', params.id)
    .eq('creator_id', user.id)
    .single()

  if (!clientRecord || !clientRecord.client_id) {
    return NextResponse.json({ error: 'Client not found or not yet registered' }, { status: 404 })
  }

  // Check per-client project limit
  const { data: sub } = await supabase
    .from('creator_subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('creator_id', user.id)
    .single()

  const maxProjects = sub?.subscription_tiers?.max_projects_per_client || 5

  const { count } = await supabase
    .from('client_project_access')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientRecord.client_id)
    .eq('granted_by', user.id)

  if ((count || 0) >= maxProjects) {
    return NextResponse.json({ error: `Project limit reached for this client (${maxProjects}). Upgrade your plan.` }, { status: 403 })
  }

  // Grant access
  const { data, error } = await supabase
    .from('client_project_access')
    .insert({
      client_id: clientRecord.client_id,
      project_id,
      granted_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Client already has access to this project' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, current_round, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, revision_round, parent_id, created_at))`)
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('creator_id')
    .eq('id', params.id)
    .single()

  if (!project || project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  // Delete client_project_access records for this project
  await supabase
    .from('client_project_access')
    .delete()
    .eq('project_id', params.id)

  // Delete the project (cascades to files, comments, versions)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

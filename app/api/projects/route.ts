import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  const supabase = createServiceClient()

  const selectQuery = `*, files (id, name, type, version, status, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, created_at))`

  if (user) {
    // Check user role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'creator'

    if (role === 'client') {
      // Client: only see projects they have access to via client_project_access
      const { data: accessRecords } = await supabase
        .from('client_project_access')
        .select('project_id')
        .eq('client_id', user.id)

      const projectIds = (accessRecords || []).map((r: any) => r.project_id)

      if (projectIds.length === 0) {
        return NextResponse.json([])
      }

      const { data, error } = await supabase
        .from('projects')
        .select(selectQuery)
        .in('id', projectIds)
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    } else {
      // Creator: show their own projects
      const { data, error } = await supabase
        .from('projects')
        .select(selectQuery)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
  }

  // Unauthenticated: return empty
  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: body.name,
      creator_id: user.id,
      status: body.status || 'Draft',
      client_name: body.client_name,
    })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

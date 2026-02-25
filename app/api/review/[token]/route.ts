import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', loginUrl: `/login?redirect=/review/${params.token}` },
      { status: 401 }
    )
  }

  const supabase = createServiceClient()

  // Fetch the project by review token
  const { data, error } = await supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, created_at))`)
    .eq('review_token', params.token)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Check user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'creator'

  // If creator and owns the project, allow (preview mode)
  if (role === 'creator' && data.creator_id === user.id) {
    return NextResponse.json(data)
  }

  // If client, verify they have access
  if (role === 'client') {
    const { data: access } = await supabase
      .from('client_project_access')
      .select('id')
      .eq('client_id', user.id)
      .eq('project_id', data.id)
      .single()

    if (!access) {
      return NextResponse.json({ error: 'You do not have access to this project' }, { status: 403 })
    }
  }

  return NextResponse.json(data)
}

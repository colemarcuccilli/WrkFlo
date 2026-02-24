import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // Get the authenticated user from the session
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  const supabase = createServiceClient()

  let query = supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, created_at))`)
    .order('created_at', { ascending: false })

  // Scope to authenticated user's projects if logged in
  if (user) {
    query = query.eq('creator_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  // Get the authenticated user from the session
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

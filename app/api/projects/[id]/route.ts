import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, created_at))`)
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

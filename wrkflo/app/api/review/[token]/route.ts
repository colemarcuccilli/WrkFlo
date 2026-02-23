import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, url, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, created_at))`)
    .eq('review_token', params.token)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

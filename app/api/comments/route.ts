import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      file_id: body.file_id,
      author_id: body.author_id || null,
      author_name: body.author_name,
      author_role: body.author_role || 'client',
      content: body.content,
      timestamp_data: body.timestamp_data || null,
    })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

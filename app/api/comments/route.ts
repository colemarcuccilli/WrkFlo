import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()

  // Get the file's current revision round
  let revisionRound = body.revision_round || 1
  if (body.file_id && !body.revision_round) {
    const { data: file } = await supabase
      .from('files')
      .select('current_round')
      .eq('id', body.file_id)
      .single()
    if (file?.current_round) {
      revisionRound = file.current_round
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      file_id: body.file_id,
      author_id: body.author_id || null,
      author_name: body.author_name,
      author_role: body.author_role || 'client',
      content: body.content,
      timestamp_data: body.timestamp_data || null,
      revision_round: revisionRound,
      parent_id: body.parent_id || null,
    })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

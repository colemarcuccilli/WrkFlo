import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { status } = await req.json()

  // Get current file state to check if we need to increment round
  const { data: currentFile } = await supabase
    .from('files')
    .select('status, current_round')
    .eq('id', params.id)
    .single()

  const currentRound = currentFile?.current_round || 1
  const wasChangesRequested = currentFile?.status === 'changes-requested'

  // If going from changes-requested → in-review, this is a new revision round
  const newRound = (wasChangesRequested && status === 'in-review')
    ? currentRound + 1
    : currentRound

  const updateData: any = { status }
  if (newRound !== currentRound) {
    updateData.current_round = newRound
  }

  const { data, error } = await supabase
    .from('files')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

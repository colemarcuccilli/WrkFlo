import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/files/[id]/version — create a new version from cloud storage
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()

    const { url, storage_type, external_id, mime_type, name, notes = '' } = body

    if (!url || !storage_type) {
      return NextResponse.json({ error: 'url and storage_type are required' }, { status: 400 })
    }

    // Get current file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('*, file_versions(*)')
      .eq('id', params.id)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Determine new version number
    const currentVersionNum = parseInt((fileRecord.version || 'V1').replace('V', '')) || 1
    const newVersionLabel = `V${currentVersionNum + 1}`
    const newRound = (fileRecord.current_round || 1) + 1

    // Insert version record
    await supabase.from('file_versions').insert({
      file_id: params.id,
      version_label: newVersionLabel,
      notes,
    })

    // Update file record: new version, reset to in-review, bump revision round
    const { data: updated, error: updateError } = await supabase
      .from('files')
      .update({
        version: newVersionLabel,
        url,
        status: 'in-review',
        storage_type,
        external_id: external_id || null,
        mime_type: mime_type || null,
        current_round: newRound,
        upload_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Version upload failed' }, { status: 500 })
  }
}

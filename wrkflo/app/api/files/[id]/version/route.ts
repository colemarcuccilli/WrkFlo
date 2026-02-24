import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/files/[id]/version — upload a new version of a file
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const notes = formData.get('notes') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
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

    // Upload new file to storage
    const storagePath = `projects/${fileRecord.project_id}/${Date.now()}-v${currentVersionNum + 1}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const arrayBuffer = await file.arrayBuffer()
    
    const { error: storageError } = await supabase.storage
      .from('wrkflo-files')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    const { data: urlData } = supabase.storage
      .from('wrkflo-files')
      .getPublicUrl(storagePath)

    const newUrl = storageError ? fileRecord.url : (urlData?.publicUrl || fileRecord.url)

    // Insert version record
    await supabase.from('file_versions').insert({
      file_id: params.id,
      version_label: newVersionLabel,
      notes,
    })

    // Update file record with new version + reset to in-review
    const { data: updated, error: updateError } = await supabase
      .from('files')
      .update({
        version: newVersionLabel,
        url: newUrl,
        status: 'in-review',
        storage_type: 'local',
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

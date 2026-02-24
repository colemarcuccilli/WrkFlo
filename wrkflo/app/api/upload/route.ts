import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Detect file type from MIME type
function detectType(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('document') || mimeType.includes('text')) return 'document'
  return 'other'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('project_id') as string | null

    if (!file || !projectId) {
      return NextResponse.json({ error: 'file and project_id are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'bin'
    const storagePath = `projects/${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    
    const arrayBuffer = await file.arrayBuffer()
    const { error: storageError } = await supabase.storage
      .from('wrkflo-files')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (storageError) {
      // Fallback: store without real URL if storage bucket doesn't exist yet
      console.warn('Storage error (bucket may not exist):', storageError.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('wrkflo-files')
      .getPublicUrl(storagePath)

    const fileUrl = storageError
      ? null
      : urlData?.publicUrl || null

    // Insert file record into DB
    const fileType = detectType(file.type)
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        project_id: projectId,
        name: file.name,
        type: fileType,
        version: 'V1',
        status: 'in-review',
        url: fileUrl,
        storage_type: 'local',
        upload_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(fileRecord, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

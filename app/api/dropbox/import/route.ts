import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'
import { detectFileType } from '@/lib/cloud-storage'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { project_id, files } = body

    if (!project_id || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'project_id and files[] are required' }, { status: 400 })
    }

    const service = createServiceClient()
    const created = []

    for (const file of files) {
      const { id: dropboxFileId, name, mimeType } = file
      const fileType = detectFileType(mimeType || '')
      // Dropbox file IDs contain colons (id:xxx) — URL encode them
      const encodedId = encodeURIComponent(dropboxFileId)

      const { data: record, error } = await service
        .from('files')
        .insert({
          project_id,
          name,
          type: fileType,
          version: 'V1',
          status: 'in-review',
          url: `/api/dropbox/proxy/${encodedId}`,
          storage_type: 'dropbox',
          external_id: dropboxFileId,
          mime_type: mimeType,
          upload_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to import Dropbox file:', error.message)
        continue
      }

      created.push(record)
    }

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 })
  }
}

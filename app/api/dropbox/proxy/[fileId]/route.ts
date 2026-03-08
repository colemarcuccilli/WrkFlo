import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getValidAccessToken } from '@/lib/cloud-storage'

export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = params
    // Dropbox file IDs are URL-encoded (id:xxx) — decode them
    const decodedFileId = decodeURIComponent(fileId)
    const supabase = createServiceClient()

    // Find the file record to get the project owner
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*, projects!inner(creator_id)')
      .eq('external_id', decodedFileId)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const ownerId = (fileRecord as any).projects.creator_id
    const accessToken = await getValidAccessToken(ownerId, 'dropbox')

    // Dropbox uses POST with Dropbox-API-Arg header for downloads
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({ path: decodedFileId }),
    }

    const rangeHeader = req.headers.get('Range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const dbxRes = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers,
    })

    if (!dbxRes.ok && dbxRes.status !== 206) {
      return NextResponse.json(
        { error: `Dropbox returned ${dbxRes.status}` },
        { status: dbxRes.status }
      )
    }

    // Build response headers
    const responseHeaders = new Headers()
    const contentType = dbxRes.headers.get('Content-Type')
    if (contentType) responseHeaders.set('Content-Type', contentType)

    const contentLength = dbxRes.headers.get('Content-Length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)

    const contentRange = dbxRes.headers.get('Content-Range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)

    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Cache-Control', 'private, max-age=3600')

    // Override content-type from file record if Dropbox returns octet-stream
    if (fileRecord.mime_type && (!contentType || contentType === 'application/octet-stream')) {
      responseHeaders.set('Content-Type', fileRecord.mime_type)
    }

    return new NextResponse(dbxRes.body, {
      status: dbxRes.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error('Dropbox proxy error:', err)
    return NextResponse.json(
      { error: err.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

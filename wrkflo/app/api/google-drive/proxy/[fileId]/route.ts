import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getValidAccessToken } from '@/lib/google-drive'

export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = params
    const supabase = createServiceClient()

    // Find the file record to get the project owner
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*, projects!inner(creator_id)')
      .eq('external_id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const ownerId = (fileRecord as any).projects.creator_id
    const accessToken = await getValidAccessToken(ownerId)

    // Build Google Drive download URL
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`

    // Forward Range header for video/audio seeking
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    }
    const rangeHeader = req.headers.get('Range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const driveRes = await fetch(driveUrl, { headers })

    if (!driveRes.ok && driveRes.status !== 206) {
      return NextResponse.json(
        { error: `Google Drive returned ${driveRes.status}` },
        { status: driveRes.status }
      )
    }

    // Build response headers
    const responseHeaders = new Headers()
    const contentType = driveRes.headers.get('Content-Type')
    if (contentType) responseHeaders.set('Content-Type', contentType)

    const contentLength = driveRes.headers.get('Content-Length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)

    const contentRange = driveRes.headers.get('Content-Range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)

    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Cache-Control', 'private, max-age=3600')

    return new NextResponse(driveRes.body, {
      status: driveRes.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error('Google Drive proxy error:', err)
    return NextResponse.json(
      { error: err.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

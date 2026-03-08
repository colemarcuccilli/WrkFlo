import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getValidAccessToken } from '@/lib/cloud-storage'

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
    const accessToken = await getValidAccessToken(ownerId, 'onedrive')

    // Graph API returns a 302 redirect to the actual file content
    // Use redirect: 'manual' to capture the redirect URL
    const graphUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`
    const graphRes = await fetch(graphUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: 'manual',
    })

    // Get the redirect URL (Azure Blob Storage URL)
    const redirectUrl = graphRes.headers.get('Location')
    if (!redirectUrl) {
      // If no redirect, the response body might contain the file directly
      if (graphRes.ok || graphRes.status === 206) {
        const responseHeaders = new Headers()
        const contentType = graphRes.headers.get('Content-Type')
        if (contentType) responseHeaders.set('Content-Type', contentType)
        const contentLength = graphRes.headers.get('Content-Length')
        if (contentLength) responseHeaders.set('Content-Length', contentLength)
        responseHeaders.set('Accept-Ranges', 'bytes')
        responseHeaders.set('Cache-Control', 'private, max-age=3600')

        return new NextResponse(graphRes.body, {
          status: graphRes.status,
          headers: responseHeaders,
        })
      }
      return NextResponse.json(
        { error: `OneDrive returned ${graphRes.status}` },
        { status: graphRes.status }
      )
    }

    // Stream from the redirect URL with Range headers
    const headers: Record<string, string> = {}
    const rangeHeader = req.headers.get('Range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const fileRes = await fetch(redirectUrl, { headers })

    if (!fileRes.ok && fileRes.status !== 206) {
      return NextResponse.json(
        { error: `OneDrive file download returned ${fileRes.status}` },
        { status: fileRes.status }
      )
    }

    // Build response headers
    const responseHeaders = new Headers()
    const contentType = fileRes.headers.get('Content-Type')
    if (contentType) responseHeaders.set('Content-Type', contentType)

    const contentLength = fileRes.headers.get('Content-Length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)

    const contentRange = fileRes.headers.get('Content-Range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)

    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Cache-Control', 'private, max-age=3600')

    // Override content-type if Azure returns generic type
    if (fileRecord.mime_type && (!contentType || contentType === 'application/octet-stream')) {
      responseHeaders.set('Content-Type', fileRecord.mime_type)
    }

    return new NextResponse(fileRes.body, {
      status: fileRes.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error('OneDrive proxy error:', err)
    return NextResponse.json(
      { error: err.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

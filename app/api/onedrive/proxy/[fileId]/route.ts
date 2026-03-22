import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getValidAccessToken } from '@/lib/cloud-storage'

export const dynamic = "force-dynamic"

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

    // Graph API returns a 302 redirect to the actual file content (Azure Blob Storage URL)
    // This pre-authenticated URL can be used directly by the browser — much faster than proxying
    const graphUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`
    const graphRes = await fetch(graphUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: 'manual',
    })

    // Get the redirect URL (Azure Blob Storage URL)
    const redirectUrl = graphRes.headers.get('Location')
    if (redirectUrl) {
      // Redirect the browser directly to the Azure blob URL
      // This avoids proxying all bytes through the serverless function
      return NextResponse.redirect(redirectUrl, 302)
    }

    // Fallback: if no redirect, stream the response body directly
    if (graphRes.ok || graphRes.status === 206) {
      const responseHeaders = new Headers()
      const contentType = graphRes.headers.get('Content-Type')
      if (contentType) responseHeaders.set('Content-Type', contentType)
      const contentLength = graphRes.headers.get('Content-Length')
      if (contentLength) responseHeaders.set('Content-Length', contentLength)
      responseHeaders.set('Accept-Ranges', 'bytes')
      responseHeaders.set('Cache-Control', 'private, max-age=3600')

      if (fileRecord.mime_type && (!contentType || contentType === 'application/octet-stream')) {
        responseHeaders.set('Content-Type', fileRecord.mime_type)
      }

      return new NextResponse(graphRes.body, {
        status: graphRes.status,
        headers: responseHeaders,
      })
    }

    return NextResponse.json(
      { error: `OneDrive returned ${graphRes.status}` },
      { status: graphRes.status }
    )
  } catch (err: any) {
    console.error('OneDrive proxy error:', err)
    return NextResponse.json(
      { error: err.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from '@/lib/cloud-storage'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accessToken = await getValidAccessToken(user.id, 'onedrive')
    const folderId = req.nextUrl.searchParams.get('folderId')

    // Build Graph API URL for listing children
    const graphUrl = folderId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`
      : `https://graph.microsoft.com/v1.0/me/drive/root/children`

    const graphRes = await fetch(
      `${graphUrl}?$select=id,name,size,file,folder,lastModifiedDateTime&$top=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!graphRes.ok) {
      const errBody = await graphRes.text()
      return NextResponse.json({ error: `Graph API error: ${errBody}` }, { status: graphRes.status })
    }

    const data = await graphRes.json()

    const items = (data.value || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      isFolder: !!item.folder,
      size: item.size,
      mimeType: item.file?.mimeType || null,
      childCount: item.folder?.childCount || 0,
      lastModified: item.lastModifiedDateTime,
    }))

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Browse failed' }, { status: 500 })
  }
}

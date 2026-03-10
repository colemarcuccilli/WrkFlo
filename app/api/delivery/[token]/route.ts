import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServiceClient()

  // Look up project by review token
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, client_name, creator_name, status, created_at, review_token')
    .eq('review_token', params.token)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Get all files with their versions
  const { data: files } = await supabase
    .from('files')
    .select('id, name, type, version, status, url, storage_type, external_id, mime_type, upload_date, current_round, file_versions(version_label, notes, created_at)')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })

  // Get comment counts per file
  const { data: commentCounts } = await supabase
    .from('comments')
    .select('file_id')
    .in('file_id', (files || []).map(f => f.id))

  const countMap: Record<string, number> = {}
  for (const c of (commentCounts || [])) {
    countMap[c.file_id] = (countMap[c.file_id] || 0) + 1
  }

  const deliveryFiles = (files || []).map(f => ({
    ...f,
    commentCount: countMap[f.id] || 0,
    versionCount: (f.file_versions || []).length || 1,
    latestNotes: f.file_versions?.length
      ? [...f.file_versions].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.notes || ''
      : '',
  }))

  return NextResponse.json({
    ...project,
    files: deliveryFiles,
    completedAt: deliveryFiles.every(f => f.status === 'approved' || f.status === 'locked')
      ? new Date().toISOString()
      : null,
  })
}

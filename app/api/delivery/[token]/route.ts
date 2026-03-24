import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Same hash function used in password route
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'wrkflo-review-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServiceClient()

  // Look up project by review token (include review_password for check)
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, client_name, creator_name, status, created_at, review_token, review_password, updated_at')
    .eq('review_token', params.token)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Password protection check
  if (project.review_password) {
    const providedPassword = req.headers.get('X-Review-Password')
    if (!providedPassword) {
      return NextResponse.json({ passwordRequired: true, projectName: project.name })
    }
    const hashed = await hashPassword(providedPassword)
    if (hashed !== project.review_password) {
      return NextResponse.json({ passwordRequired: true, projectName: project.name, error: 'Incorrect password' })
    }
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

  // Strip review_password from response
  const { review_password, ...safeProject } = project

  return NextResponse.json({
    ...safeProject,
    files: deliveryFiles,
    completedAt: deliveryFiles.every(f => f.status === 'approved' || f.status === 'locked')
      ? new Date().toISOString()
      : null,
  })
}

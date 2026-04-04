import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ projects: [], files: [], comments: [] })
  }

  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ projects: [], files: [], comments: [] })
  }

  const supabase = createServiceClient()
  // Escape PostgREST special chars
  const safeQ = q.replace(/[%_\\(),]/g, '\\$&')
  const pattern = `%${safeQ}%`

  // Get user's project IDs first (for scoping)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'creator'

  let projectIds: string[] = []

  if (role === 'client') {
    const { data: accessRecords } = await supabase
      .from('client_project_access')
      .select('project_id')
      .eq('client_id', user.id)
    projectIds = (accessRecords || []).map((r: any) => r.project_id)
  } else {
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('creator_id', user.id)
    projectIds = (userProjects || []).map((r: any) => r.id)
  }

  if (projectIds.length === 0) {
    return NextResponse.json({ projects: [], files: [], comments: [] })
  }

  // Search projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, client_name, status')
    .in('id', projectIds)
    .or(`name.ilike.${pattern},client_name.ilike.${pattern}`)
    .limit(5)

  // Search files within those projects
  const { data: files } = await supabase
    .from('files')
    .select('id, name, project_id, projects(name)')
    .in('project_id', projectIds)
    .ilike('name', pattern)
    .limit(5)

  // Search comments on files within those projects
  const { data: fileIds } = await supabase
    .from('files')
    .select('id')
    .in('project_id', projectIds)

  const allFileIds = (fileIds || []).map((f: any) => f.id)

  let comments: any[] = []
  if (allFileIds.length > 0) {
    const { data: commentData } = await supabase
      .from('comments')
      .select('id, content, author_name, file_id, files(name, project_id)')
      .in('file_id', allFileIds)
      .ilike('content', pattern)
      .limit(5)
    comments = (commentData || []).map((c: any) => ({
      ...c,
      file_name: c.files?.name,
      project_id: c.files?.project_id,
    }))
  }

  // Normalize files to include project_name
  const normalizedFiles = (files || []).map((f: any) => ({
    ...f,
    project_name: (f.projects as any)?.name || '',
  }))

  return NextResponse.json({
    projects: projects || [],
    files: normalizedFiles,
    comments,
  })
}

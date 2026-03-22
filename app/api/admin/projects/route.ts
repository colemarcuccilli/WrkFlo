import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceClient()

    const { data: projects, error } = await service
      .from('projects')
      .select(`
        id,
        name,
        status,
        client_name,
        creator_name,
        created_at,
        updated_at,
        creator_id,
        users!projects_creator_id_fkey ( email, name )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get file counts and comment counts per project
    const { data: files } = await service
      .from('files')
      .select('id, project_id')

    const { data: comments } = await service
      .from('comments')
      .select('id, file_id')

    const filesByProject: Record<string, number> = {}
    const fileIdToProject: Record<string, string> = {}
    for (const f of files || []) {
      if (f.project_id) {
        filesByProject[f.project_id] = (filesByProject[f.project_id] || 0) + 1
        fileIdToProject[f.id] = f.project_id
      }
    }

    const commentsByProject: Record<string, number> = {}
    for (const c of comments || []) {
      const projId = fileIdToProject[c.file_id]
      if (projId) {
        commentsByProject[projId] = (commentsByProject[projId] || 0) + 1
      }
    }

    const enriched = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      client_name: p.client_name,
      creator_email: p.users?.email || 'Unknown',
      creator_name: p.creator_name || p.users?.name || 'Unknown',
      created_at: p.created_at,
      updated_at: p.updated_at,
      file_count: filesByProject[p.id] || 0,
      comment_count: commentsByProject[p.id] || 0,
    }))

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('Admin projects error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

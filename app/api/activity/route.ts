import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  
  // Get recent comments (last 20)
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id, author_name, author_role, content, created_at,
      files (id, name, project_id, projects (id, name))
    `)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to activity feed format
  const activities = (comments || []).map((c: any) => ({
    id: c.id,
    type: 'comment',
    user: c.author_name || 'Unknown',
    action: 'commented on',
    target: c.files?.name || 'a file',
    projectId: c.files?.project_id,
    projectName: c.files?.projects?.name,
    time: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
    color: c.author_role === 'client' ? 'text-orange-500' : 'text-orange-600',
  }))

  return NextResponse.json(activities)
}

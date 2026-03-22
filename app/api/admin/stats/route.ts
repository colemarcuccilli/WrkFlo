import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceClient()

    const [usersRes, projectsRes, filesRes, commentsRes, reportsRes] = await Promise.all([
      service.from('users').select('id', { count: 'exact', head: true }),
      service.from('projects').select('id', { count: 'exact', head: true }),
      service.from('files').select('id', { count: 'exact', head: true }),
      service.from('comments').select('id', { count: 'exact', head: true }),
      service.from('bug_reports').select('id', { count: 'exact', head: true }),
    ])

    // Active users: users who created/updated projects in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: activeProjects } = await service
      .from('projects')
      .select('creator_id')
      .gte('updated_at', sevenDaysAgo)

    const activeUserIds = new Set((activeProjects || []).map(p => p.creator_id).filter(Boolean))

    return NextResponse.json({
      users: usersRes.count || 0,
      projects: projectsRes.count || 0,
      files: filesRes.count || 0,
      comments: commentsRes.count || 0,
      bugReports: reportsRes.count || 0,
      activeUsers: activeUserIds.size,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

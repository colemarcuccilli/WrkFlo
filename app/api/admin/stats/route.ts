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

    // Basic counts
    const [usersRes, projectsRes, filesRes, commentsRes, reportsRes, versionsRes, clientsRes] = await Promise.all([
      service.from('users').select('id', { count: 'exact', head: true }),
      service.from('projects').select('id', { count: 'exact', head: true }),
      service.from('files').select('id', { count: 'exact', head: true }),
      service.from('comments').select('id', { count: 'exact', head: true }),
      service.from('bug_reports').select('id', { count: 'exact', head: true }),
      service.from('file_versions').select('id', { count: 'exact', head: true }),
      service.from('creator_clients').select('id', { count: 'exact', head: true }),
    ])

    // Active users from activity_log (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

    let activeUsers = 0
    let activityToday = 0
    let activityThisWeek = 0

    try {
      const { data: weekActivity } = await service
        .from('activity_log')
        .select('user_id, user_email')
        .gte('created_at', sevenDaysAgo)
      const uniqueUsers = new Set((weekActivity || []).map(a => a.user_id || a.user_email).filter(Boolean))
      activeUsers = uniqueUsers.size

      const { count: todayCount } = await service
        .from('activity_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart)
      activityToday = todayCount || 0

      const { count: weekCount } = await service
        .from('activity_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)
      activityThisWeek = weekCount || 0
    } catch {
      // activity_log table may not exist yet, fallback to project-based
      const { data: activeProjects } = await service
        .from('projects')
        .select('creator_id')
        .gte('updated_at', sevenDaysAgo)
      activeUsers = new Set((activeProjects || []).map(p => p.creator_id).filter(Boolean)).size
    }

    // Feedback stats
    let feedbackResponses = 0
    let avgRating: number | null = null
    try {
      const { count } = await service.from('feedback_responses').select('id', { count: 'exact', head: true })
      feedbackResponses = count || 0
      const { data: ratings } = await service.from('feedback_responses').select('rating').not('rating', 'is', null)
      if (ratings && ratings.length > 0) {
        avgRating = Math.round((ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length) * 10) / 10
      }
    } catch {}

    // Projects by status
    const { data: allProjects } = await service.from('projects').select('status')
    const projectsByStatus: Record<string, number> = {}
    ;(allProjects || []).forEach((p: any) => {
      const s = p.status || 'Draft'
      projectsByStatus[s] = (projectsByStatus[s] || 0) + 1
    })

    // Top creators
    const { data: creators } = await service
      .from('users')
      .select('id, email, name')
      .eq('role', 'creator')
      .limit(100)

    const topCreators: any[] = []
    if (creators) {
      for (const c of creators) {
        const { count } = await service
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', c.id)
        topCreators.push({ email: c.email, name: c.name, projectCount: count || 0 })
      }
      topCreators.sort((a, b) => b.projectCount - a.projectCount)
    }

    return NextResponse.json({
      users: usersRes.count || 0,
      projects: projectsRes.count || 0,
      files: filesRes.count || 0,
      comments: commentsRes.count || 0,
      bugReports: reportsRes.count || 0,
      totalRevisions: versionsRes.count || 0,
      totalClientInvites: clientsRes.count || 0,
      activeUsers,
      activityToday,
      activityThisWeek,
      feedbackResponses,
      avgRating,
      projectsByStatus,
      topCreators: topCreators.slice(0, 5),
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

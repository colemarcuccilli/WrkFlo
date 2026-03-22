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

    const { data: users, error } = await service
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get project counts per user
    const { data: projectCounts } = await service
      .from('projects')
      .select('creator_id')

    const countMap: Record<string, number> = {}
    for (const p of projectCounts || []) {
      if (p.creator_id) {
        countMap[p.creator_id] = (countMap[p.creator_id] || 0) + 1
      }
    }

    const enriched = (users || []).map(u => ({
      ...u,
      project_count: countMap[u.id] || 0,
    }))

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('Admin users error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

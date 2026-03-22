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

    // Get recent comments with file and project info
    const { data: comments, error } = await service
      .from('comments')
      .select(`
        id,
        content,
        author_name,
        created_at,
        file_id,
        files!inner (
          name,
          project_id,
          projects!inner (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const activity = (comments || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      author_name: c.author_name,
      created_at: c.created_at,
      file_name: c.files?.name || 'Unknown',
      project_name: c.files?.projects?.name || 'Unknown',
    }))

    return NextResponse.json(activity)
  } catch (err) {
    console.error('Admin activity error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

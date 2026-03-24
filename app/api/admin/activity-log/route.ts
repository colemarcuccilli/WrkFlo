import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const category = searchParams.get('category')

    const service = createServiceClient()
    let query = service
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Admin activity log error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

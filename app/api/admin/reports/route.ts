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
    const { data, error } = await service
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet - handle gracefully
      if (error.code === '42P01') {
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Admin reports error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const validStatuses = ['new', 'investigating', 'resolved', 'dismissed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data, error } = await service
      .from('bug_reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin report update error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

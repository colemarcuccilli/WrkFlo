import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, user_email, action, category, resource_type, resource_id, metadata } = body

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service.from('activity_log').insert({
      user_id: user_id || null,
      user_email: user_email || null,
      action,
      category: category || 'general',
      resource_type: resource_type || null,
      resource_id: resource_id || null,
      metadata: metadata || {},
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Activity log error:', err)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}

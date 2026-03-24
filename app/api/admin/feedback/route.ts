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
      .from('feedback_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Admin feedback error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

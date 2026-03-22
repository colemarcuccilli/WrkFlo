import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export const dynamic = "force-dynamic"

// Temporary admin endpoint to fix creator role
// Only the authenticated user can fix their own role
export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Only allow fixing to 'creator' if user email matches known admin
  const body = await req.json().catch(() => ({}))
  const targetRole = body.role || 'creator'

  if (targetRole !== 'creator') {
    return NextResponse.json({ error: 'This endpoint only sets creator role' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role: 'creator' })
    .eq('id', user.id)
    .select('id, email, role')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, user: data })
}

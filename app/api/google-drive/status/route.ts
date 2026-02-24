import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const { data: row } = await service
    .from('user_drive_tokens')
    .select('google_email')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    connected: !!row,
    google_email: row?.google_email || null,
  })
}

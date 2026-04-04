import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConnectionStatus } from '@/lib/cloud-storage'

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getConnectionStatus(user.id, 'google_drive')

  return NextResponse.json({
    connected: status.connected,
    google_email: status.email,
  })
}

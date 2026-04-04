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

  const status = await getConnectionStatus(user.id, 'onedrive')

  return NextResponse.json({
    connected: status.connected,
    account_email: status.email,
    account_name: status.name,
  })
}

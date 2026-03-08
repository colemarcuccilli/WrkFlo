import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeAccess } from '@/lib/cloud-storage'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await revokeAccess(user.id, 'google_drive')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to disconnect' }, { status: 500 })
  }
}

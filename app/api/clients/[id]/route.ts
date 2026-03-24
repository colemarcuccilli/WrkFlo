import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { sendClientInviteEmail } from '@/lib/email'

// In-memory rate limit tracker: email -> { count, resetAt }
const resendLimits = new Map<string, { count: number; resetAt: number }>()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const body = await req.json()

  // Resend invite email
  if (body.action === 'resend') {
    const { data: clientRecord } = await supabase
      .from('creator_clients')
      .select('*')
      .eq('id', params.id)
      .eq('creator_id', user.id)
      .single()

    if (!clientRecord) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (clientRecord.status !== 'pending') return NextResponse.json({ error: 'Can only resend to pending invites' }, { status: 400 })

    // Rate limit: 3 resends per email per day
    const now = Date.now()
    const key = clientRecord.client_email
    const limit = resendLimits.get(key)
    if (limit && limit.resetAt > now) {
      if (limit.count >= 3) {
        return NextResponse.json({ error: 'Resend limit reached (3 per day). Try again tomorrow.' }, { status: 429 })
      }
      limit.count++
    } else {
      resendLimits.set(key, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 })
    }

    const creatorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A creator'
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://wrkflo.us'

    try {
      await sendClientInviteEmail({
        to: clientRecord.client_email,
        creatorName,
        joinUrl: `${origin}/join?email=${encodeURIComponent(clientRecord.client_email)}&from=${encodeURIComponent(creatorName)}`,
      })
    } catch (emailErr: any) {
      return NextResponse.json({ error: 'Failed to send email: ' + emailErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Invite resent' })
  }

  // Cancel pending invite (actually deletes the record so they can be re-invited)
  if (body.action === 'cancel') {
    const { data: clientRecord } = await supabase
      .from('creator_clients')
      .select('*')
      .eq('id', params.id)
      .eq('creator_id', user.id)
      .single()

    if (!clientRecord) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (clientRecord.status !== 'pending') return NextResponse.json({ error: 'Can only cancel pending invites' }, { status: 400 })

    const { error } = await supabase
      .from('creator_clients')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Invite cancelled' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify this is the creator's client
  const { data: clientRecord } = await supabase
    .from('creator_clients')
    .select('*')
    .eq('id', params.id)
    .eq('creator_id', user.id)
    .single()

  if (!clientRecord) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Remove all project access for this client
  if (clientRecord.client_id) {
    await supabase
      .from('client_project_access')
      .delete()
      .eq('client_id', clientRecord.client_id)
      .eq('granted_by', user.id)
  }

  // Set status to revoked
  const { error } = await supabase
    .from('creator_clients')
    .update({ status: 'revoked' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

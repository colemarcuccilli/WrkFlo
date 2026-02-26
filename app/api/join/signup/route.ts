import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Server-side client signup — auto-confirms since they were invited via email
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verify this email was actually invited
  const { data: invite } = await supabase
    .from('creator_clients')
    .select('id')
    .eq('client_email', email)
    .in('status', ['pending', 'active'])
    .limit(1)
    .single()

  if (!invite) {
    return NextResponse.json({ error: 'No invitation found for this email. Ask the creator to invite you first.' }, { status: 403 })
  }

  // Check if this email already belongs to a creator — don't allow signup that would conflict
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single()

  if (existingUser?.role === 'creator') {
    return NextResponse.json({ error: 'This email belongs to a creator account. Please sign in instead.' }, { status: 409 })
  }

  // Create user via admin API — auto-confirmed, no email needed
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || email.split('@')[0], role: 'client' },
  })

  if (authError) {
    // If user already exists, tell them to sign in
    if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const userId = authData.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  // Set role to client in users table
  await supabase
    .from('users')
    .update({ role: 'client', name: name || email.split('@')[0] })
    .eq('id', userId)

  // Activate all pending invites for this email
  await supabase
    .from('creator_clients')
    .update({ client_id: userId, status: 'active' })
    .eq('client_email', email)
    .eq('status', 'pending')

  return NextResponse.json({ ok: true, userId })
}

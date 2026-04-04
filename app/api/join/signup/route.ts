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
  const normalizedEmail = email.toLowerCase().trim()

  // Check if this is a beta invite (from admin panel)
  const { data: betaInvite } = await supabase
    .from('beta_invites')
    .select('id')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  // Check if this is a client invite (from a creator)
  const { data: clientInvite } = await supabase
    .from('creator_clients')
    .select('id')
    .ilike('client_email', normalizedEmail)
    .in('status', ['pending', 'active'])
    .maybeSingle()

  const isBetaInvite = !!betaInvite
  const isClientInvite = !!clientInvite

  if (!isBetaInvite && !isClientInvite) {
    return NextResponse.json({ error: 'No invitation found for this email. Ask the creator to invite you first.' }, { status: 403 })
  }

  // Check if this email already belongs to a creator — don't allow signup that would conflict
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  if (existingUser?.role === 'creator') {
    return NextResponse.json({ error: 'This email belongs to a creator account. Please sign in instead.' }, { status: 409 })
  }

  // Beta invites get creator role, client invites get client role
  const assignedRole = isBetaInvite ? 'creator' : 'client'

  // Create user via admin API — auto-confirmed, no email needed
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || email.split('@')[0], role: assignedRole },
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

  // Set role in users table
  await supabase
    .from('users')
    .update({ role: assignedRole, name: name || email.split('@')[0] })
    .eq('id', userId)

  // Mark beta invite as accepted
  if (isBetaInvite) {
    await supabase
      .from('beta_invites')
      .update({ status: 'accepted', used: true, used_by: normalizedEmail, used_at: new Date().toISOString() })
      .ilike('email', normalizedEmail)
  }

  // Activate all pending client invites for this email
  if (isClientInvite) {
    await supabase
      .from('creator_clients')
      .update({ client_id: userId, status: 'active' })
      .ilike('client_email', normalizedEmail)
      .eq('status', 'pending')
  }

  return NextResponse.json({ ok: true, userId })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const role = searchParams.get('role')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Ensure user profile exists (fallback if DB trigger failed)
        const serviceClient = createServiceClient()
        const { data: existingUserProfile } = await serviceClient
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        // Check if this user has a beta invite
        const normalizedEmail = (user.email || '').toLowerCase().trim()
        const { data: betaInvite } = await serviceClient
          .from('beta_invites')
          .select('id')
          .ilike('email', normalizedEmail)
          .eq('used', false)
          .maybeSingle()

        const isBetaUser = !!betaInvite

        if (!existingUserProfile) {
          // Determine role: beta invite → creator, explicit role param, or default
          const assignedRole = isBetaUser ? 'creator' : (role === 'client' ? 'client' : 'creator')
          await serviceClient.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: assignedRole,
          })
        } else if (isBetaUser && existingUserProfile) {
          // Existing user with unused beta invite — upgrade to creator
          const { data: currentRole } = await serviceClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          if (currentRole?.role !== 'creator') {
            await serviceClient
              .from('users')
              .update({ role: 'creator' })
              .eq('id', user.id)
          }
        }

        // Mark beta invite as used
        if (isBetaUser) {
          await serviceClient
            .from('beta_invites')
            .update({ status: 'accepted', used: true, used_by: normalizedEmail, used_at: new Date().toISOString() })
            .ilike('email', normalizedEmail)
        }

        // If signing up as a client (from /join page), set role and activate invites
        if (role === 'client' && !isBetaUser) {
          // Check current role — NEVER downgrade a creator to client
          const { data: existingProfile } = await serviceClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          if (existingProfile?.role !== 'creator') {
            await serviceClient
              .from('users')
              .update({ role: 'client' })
              .eq('id', user.id)
          }

          // Activate any pending invites for this email
          const { data: pendingInvites } = await serviceClient
            .from('creator_clients')
            .select('*')
            .eq('client_email', user.email)
            .eq('status', 'pending')

          if (pendingInvites && pendingInvites.length > 0) {
            for (const invite of pendingInvites) {
              await serviceClient
                .from('creator_clients')
                .update({ client_id: user.id, status: 'active' })
                .eq('id', invite.id)
            }
          }

          // Redirect based on actual role (creator stays on dashboard)
          if (existingProfile?.role === 'creator') {
            return NextResponse.redirect(`${origin}/dashboard`)
          }
          return NextResponse.redirect(`${origin}/client-dashboard`)
        }

        // Beta users always go to creator dashboard
        if (isBetaUser) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // If there's an explicit redirect, use it
        if (next) {
          return NextResponse.redirect(`${origin}${next}`)
        }

        // Otherwise, redirect based on role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'client') {
          return NextResponse.redirect(`${origin}/client-dashboard`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}

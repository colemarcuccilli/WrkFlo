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
        // If signing up as a client (from /join page), set role and activate invites
        if (role === 'client') {
          const serviceClient = createServiceClient()

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

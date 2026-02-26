import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { sendClientInviteEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Get creator's subscription + tier info
  const { data: sub } = await supabase
    .from('creator_subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('creator_id', user.id)
    .single()

  // Get creator's clients
  const { data: clients, error } = await supabase
    .from('creator_clients')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch project access counts separately to avoid join issues
  const clientsWithAccess = await Promise.all(
    (clients || []).map(async (c: any) => {
      if (c.client_id) {
        const { data: access } = await supabase
          .from('client_project_access')
          .select('project_id')
          .eq('client_id', c.client_id)
        return { ...c, client_project_access: access || [] }
      }
      return { ...c, client_project_access: [] }
    })
  )

  // Default to Starter tier if no subscription
  const tier = sub?.subscription_tiers || { name: 'Starter', max_clients: 5, max_projects_per_client: 5 }

  return NextResponse.json({
    clients: clientsWithAccess,
    tier,
    usage: {
      clientsUsed: clientsWithAccess.filter((c: any) => c.status === 'active' || c.status === 'pending').length,
      maxClients: tier.max_clients,
    },
    subscription: sub,
  })
}

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const body = await req.json()
  const { email } = body

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  // Check tier limits
  const { data: sub } = await supabase
    .from('creator_subscriptions')
    .select('*, subscription_tiers(*)')
    .eq('creator_id', user.id)
    .single()

  const tier = sub?.subscription_tiers || { max_clients: 5 }

  const { count } = await supabase
    .from('creator_clients')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', user.id)
    .in('status', ['active', 'pending'])

  if ((count || 0) >= tier.max_clients) {
    return NextResponse.json({ error: `Client limit reached (${tier.max_clients}). Upgrade your plan to invite more clients.` }, { status: 403 })
  }

  // Check if client already exists as a user
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single()

  // Insert creator_clients record
  const { data: clientRecord, error } = await supabase
    .from('creator_clients')
    .insert({
      creator_id: user.id,
      client_id: existingUser?.id || null,
      client_email: email,
      status: existingUser ? 'active' : 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This client has already been invited' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If client exists, update their role to 'client' if not already
  if (existingUser && existingUser.role !== 'client') {
    await supabase
      .from('users')
      .update({ role: 'client' })
      .eq('id', existingUser.id)
  }

  // Send invitation email
  const creatorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A creator'
  const origin = req.headers.get('origin') || 'https://wrkflo-sweet-dreams-projects.vercel.app'
  const joinUrl = `${origin}/join?email=${encodeURIComponent(email)}&from=${encodeURIComponent(creatorName)}`

  try {
    await sendClientInviteEmail({
      to: email,
      creatorName,
      joinUrl,
    })
  } catch (emailErr) {
    console.error('Failed to send invite email:', emailErr)
    // Don't fail the invite if email fails — client record is already created
  }

  return NextResponse.json(clientRecord, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

// Simple hash function for review link passwords (not for user accounts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'wrkflo-review-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// PATCH — set or update password
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('id', params.id)
    .single()

  if (!project || project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  const body = await req.json()
  const { password } = body

  if (!password || typeof password !== 'string' || password.length < 1) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const hashed = await hashPassword(password)

  const { error } = await supabase
    .from('projects')
    .update({ review_password: hashed })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// DELETE — remove password
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('id', params.id)
    .single()

  if (!project || project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  const { error } = await supabase
    .from('projects')
    .update({ review_password: null })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

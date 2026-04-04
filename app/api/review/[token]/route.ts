import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

// Same hash function used in password route
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'wrkflo-review-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', loginUrl: `/login?redirect=/review/${params.token}` },
      { status: 401 }
    )
  }

  const supabase = createServiceClient()

  // Fetch the project by review token (include review_password)
  const { data, error } = await supabase
    .from('projects')
    .select(`*, files (id, name, type, version, status, current_round, url, storage_type, external_id, mime_type, duration, upload_date, file_versions (id, version_label, notes, created_at), comments (id, author_name, author_role, content, timestamp_data, revision_round, created_at))`)
    .eq('review_token', params.token)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Check user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'creator'

  // If creator and owns the project, skip password check (preview mode)
  if (role === 'creator' && data.creator_id === user.id) {
    const { review_password, ...safeData } = data
    return NextResponse.json(safeData)
  }

  // Password protection check for non-creators
  if (data.review_password) {
    const providedPassword = req.headers.get('X-Review-Password')
    if (!providedPassword) {
      return NextResponse.json({ passwordRequired: true, projectName: data.name })
    }
    const hashed = await hashPassword(providedPassword)
    if (hashed !== data.review_password) {
      return NextResponse.json({ passwordRequired: true, projectName: data.name, error: 'Incorrect password' })
    }
  }

  // If client, verify they have access
  if (role === 'client') {
    const { data: access } = await supabase
      .from('client_project_access')
      .select('id')
      .eq('client_id', user.id)
      .eq('project_id', data.id)
      .maybeSingle()

    if (!access) {
      return NextResponse.json({ error: 'You do not have access to this project' }, { status: 403 })
    }
  }

  // Strip review_password from response
  const { review_password, ...safeData } = data
  return NextResponse.json(safeData)
}

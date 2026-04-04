import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { sendCommentNotification } from '@/lib/email'

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()

  // Auth check: require either a valid session or a valid review token
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    // Check for review token (guest reviewers)
    const reviewToken = req.headers.get('x-review-token')
    if (!reviewToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    // Verify the token matches the file's project
    const { data: file } = await supabase.from('files').select('project_id').eq('id', body.file_id).maybeSingle()
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    const { data: project } = await supabase.from('projects').select('review_token').eq('id', file.project_id).maybeSingle()
    if (!project || String(project.review_token) !== reviewToken) {
      return NextResponse.json({ error: 'Invalid review token' }, { status: 403 })
    }
  }

  // Get the file's current revision round
  let revisionRound = body.revision_round || 1
  if (body.file_id && !body.revision_round) {
    const { data: file } = await supabase
      .from('files')
      .select('current_round')
      .eq('id', body.file_id)
      .single()
    if (file?.current_round) {
      revisionRound = file.current_round
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      file_id: body.file_id,
      author_id: body.author_id || null,
      author_name: body.author_name,
      author_role: body.author_role || 'client',
      content: body.content,
      timestamp_data: body.timestamp_data || null,
      revision_round: revisionRound,
      parent_id: body.parent_id || null,
    })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Track comment activity server-side
  // Track activity (fire and forget)
  Promise.resolve(createServiceClient().from('activity_log').insert({
    user_id: body.author_id || null,
    user_email: body.author_name || null,
    action: 'comment_added',
    category: 'comment',
    resource_type: 'file',
    resource_id: body.file_id,
    metadata: { role: body.author_role },
  })).catch(() => {})

  // Send email notification to creator when a client comments
  if (body.author_role === 'client' && body.file_id) {
    try {
      // Look up file → project → creator
      const { data: file } = await supabase
        .from('files')
        .select('name, project_id')
        .eq('id', body.file_id)
        .single()

      if (file?.project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('name, creator_id')
          .eq('id', file.project_id)
          .single()

        if (project?.creator_id) {
          const { data: creator } = await supabase
            .from('users')
            .select('email')
            .eq('id', project.creator_id)
            .single()

          if (creator?.email) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wrkflo.us')

            sendCommentNotification({
              to: creator.email,
              clientName: body.author_name || 'A client',
              commentText: body.content || '',
              fileName: file.name,
              projectName: project.name,
              projectUrl: `${baseUrl}/project/${file.project_id}`,
            }).catch(err => console.error('Comment email failed:', err))
          }
        }
      }
    } catch (err) {
      console.error('Error preparing comment notification:', err)
    }
  }

  return NextResponse.json(data, { status: 201 })
}

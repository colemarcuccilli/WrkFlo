import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import {
  sendApprovalNotification,
  sendChangesRequestedNotification,
  sendProjectCompleteNotification,
} from '@/lib/email'

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { status, client_name } = body

  // Get current file state to check if we need to increment round
  const { data: currentFile } = await supabase
    .from('files')
    .select('status, current_round, name, project_id')
    .eq('id', params.id)
    .single()

  if (!currentFile) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Auth check: require either session or valid review token
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    const reviewToken = req.headers.get('x-review-token')
    if (!reviewToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const { data: project } = await supabase.from('projects').select('review_token').eq('id', currentFile.project_id).single()
    if (!project || String(project.review_token) !== reviewToken) {
      return NextResponse.json({ error: 'Invalid review token' }, { status: 403 })
    }
  }

  const currentRound = currentFile?.current_round || 1
  const wasChangesRequested = currentFile?.status === 'changes-requested'

  // If going from changes-requested -> in-review, this is a new revision round
  const newRound = (wasChangesRequested && status === 'in-review')
    ? currentRound + 1
    : currentRound

  const updateData: any = { status }
  if (newRound !== currentRound) {
    updateData.current_round = newRound
  }

  const { data, error } = await supabase
    .from('files')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Track status change activity server-side
  Promise.resolve(createServiceClient().from('activity_log').insert({
    user_id: null,
    action: body.status === 'approved' ? 'file_approved' : 'changes_requested',
    category: 'status',
    resource_type: 'file',
    resource_id: params.id,
  })).catch(() => {})

  // Send email notifications for approval / changes-requested
  if ((status === 'approved' || status === 'changes-requested') && currentFile?.project_id) {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('name, creator_id, client_name')
        .eq('id', currentFile.project_id)
        .single()

      if (project?.creator_id) {
        const { data: creator } = await supabase
          .from('users')
          .select('email')
          .eq('id', project.creator_id)
          .single()

        if (creator?.email) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wrkflo.us')
          const projectUrl = `${baseUrl}/project/${currentFile.project_id}`
          const resolvedClientName = client_name || project.client_name || 'Your client'

          if (status === 'approved') {
            // Get approval counts for this project
            const { data: allFiles } = await supabase
              .from('files')
              .select('id, status')
              .eq('project_id', currentFile.project_id)

            const totalCount = allFiles?.length || 0
            const approvedCount = allFiles?.filter(f => f.status === 'approved').length || 0

            sendApprovalNotification({
              to: creator.email,
              clientName: resolvedClientName,
              fileName: currentFile.name,
              projectName: project.name,
              approvedCount,
              totalCount,
              projectUrl,
            }).catch(err => console.error('Approval email failed:', err))

            // Check if ALL files are now approved
            if (totalCount > 0 && approvedCount === totalCount) {
              const completionDate = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })

              sendProjectCompleteNotification({
                to: creator.email,
                projectName: project.name,
                clientName: resolvedClientName,
                totalFiles: totalCount,
                completionDate,
                projectUrl,
              }).catch(err => console.error('Project complete email failed:', err))
            }
          } else if (status === 'changes-requested') {
            sendChangesRequestedNotification({
              to: creator.email,
              clientName: resolvedClientName,
              fileName: currentFile.name,
              projectName: project.name,
              projectUrl,
            }).catch(err => console.error('Changes requested email failed:', err))
          }
        }
      }
    } catch (err) {
      console.error('Error preparing status notification:', err)
    }
  }

  return NextResponse.json(data)
}

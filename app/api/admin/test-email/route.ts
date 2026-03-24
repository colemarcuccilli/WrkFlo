import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import {
  sendClientInviteEmail,
  sendCommentNotification,
  sendApprovalNotification,
  sendChangesRequestedNotification,
  sendProjectCompleteNotification,
  sendReviewReadyNotification,
} from '@/lib/email'

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { emailType, recipientEmail } = await request.json()
    const to = recipientEmail || user.email!
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wrkflo.us'

    let result: any
    switch (emailType) {
      case 'client_invite':
        result = await sendClientInviteEmail({
          to,
          creatorName: 'Test Creator',
          projectNames: ['Demo Project', 'Sample Video'],
          joinUrl: `${appUrl}/join?test=true`,
        })
        break

      case 'comment_notification':
        result = await sendCommentNotification({
          to,
          clientName: 'Test Client',
          commentText: 'This is a test comment to verify email notifications are working correctly. The video looks great but I think we should adjust the color grading in the intro.',
          fileName: 'Intro_v2.mp4',
          projectName: 'Demo Project',
          projectUrl: `${appUrl}/dashboard`,
        })
        break

      case 'approval':
        result = await sendApprovalNotification({
          to,
          clientName: 'Test Client',
          fileName: 'Final_Cut.mp4',
          projectName: 'Demo Project',
          approvedCount: 3,
          totalCount: 5,
          projectUrl: `${appUrl}/dashboard`,
        })
        break

      case 'changes_requested':
        result = await sendChangesRequestedNotification({
          to,
          clientName: 'Test Client',
          fileName: 'Logo_Animation.mp4',
          projectName: 'Demo Project',
          projectUrl: `${appUrl}/dashboard`,
        })
        break

      case 'project_complete':
        result = await sendProjectCompleteNotification({
          to,
          projectName: 'Demo Project',
          clientName: 'Test Client',
          totalFiles: 5,
          completionDate: new Date().toLocaleDateString(),
          projectUrl: `${appUrl}/dashboard`,
        })
        break

      case 'review_ready':
        result = await sendReviewReadyNotification({
          to,
          creatorName: 'Test Creator',
          projectName: 'Demo Project',
          reviewUrl: `${appUrl}/review/test-token-123`,
          fileCount: 3,
        })
        break

      case 'password_reset':
        // Trigger Supabase password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(to, {
          redirectTo: `${appUrl}/reset-password`,
        })
        if (resetError) throw resetError
        result = { sent: true, type: 'password_reset' }
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json({ error: err.message || 'Failed to send test email' }, { status: 500 })
  }
}

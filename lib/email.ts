import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

// Until you verify a custom domain in Resend, emails send from onboarding@resend.dev
// Once verified, change this to e.g. noreply@wrkflo.app
const FROM_EMAIL = 'WrkFlo <noreply@wrkflo.us>'

// ─── Shared email shell ─────────────────────────────────────────────────────
function wrapEmail(cardContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#15f3ec,#16ffc0);text-align:center;line-height:48px">
        <span style="font-size:24px;color:#0a0a0f;font-weight:bold">W</span>
      </div>
      <div style="margin-top:12px">
        <span style="font-size:22px;font-weight:700;background:linear-gradient(135deg,#15f3ec,#16ffc0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">WrkFlo</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;backdrop-filter:blur(12px)">
      ${cardContent}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25)">
        Sent via <span style="color:#15f3ec">WrkFlo</span> — creative review, simplified.
      </p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `
      <div style="text-align:center;margin:28px 0">
        <a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#15f3ec,#16ffc0);color:#0a0a0f;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 20px rgba(21,243,236,0.3)">
          ${label}
        </a>
      </div>`
}

function detailRow(label: string, value: string): string {
  return `
        <tr>
          <td style="padding:6px 12px 6px 0;font-size:13px;color:rgba(255,255,255,0.4);white-space:nowrap;vertical-align:top">${label}</td>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.8)">${value}</td>
        </tr>`
}

function detailsBlock(rows: string): string {
  return `
      <div style="background:rgba(21,243,236,0.06);border:1px solid rgba(21,243,236,0.12);border-radius:12px;padding:16px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>`
}

// ─── 1. Client Invite Email (existing) ──────────────────────────────────────
export async function sendClientInviteEmail({
  to,
  creatorName,
  projectNames,
  joinUrl,
}: {
  to: string
  creatorName: string
  projectNames?: string[]
  joinUrl: string
}) {
  const projectList = projectNames && projectNames.length > 0
    ? projectNames.map(n => `<li style="padding:4px 0;color:rgba(255,255,255,0.8)">${n}</li>`).join('')
    : ''

  const html = wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95)">You've been invited!</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6)">
        <strong style="color:#15f3ec">${creatorName}</strong> has invited you to review work on WrkFlo — a collaborative platform for creative project feedback.
      </p>

      ${projectList ? `
      <div style="background:rgba(21,243,236,0.06);border:1px solid rgba(21,243,236,0.12);border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:rgba(255,255,255,0.4)">Projects shared with you</p>
        <ul style="margin:0;padding:0 0 0 16px;font-size:14px">${projectList}</ul>
      </div>
      ` : ''}

      ${ctaButton(joinUrl, 'Accept Invite')}

      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center">
        You'll be asked to create an account or sign in if you already have one.
      </p>
  `)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${creatorName} invited you to review on WrkFlo`,
    html,
  })

  if (error) {
    console.error('Resend email error:', error)
    throw new Error(error.message)
  }

  return data
}

// ─── 2. Comment Notification ─────────────────────────────────────────────────
export async function sendCommentNotification({
  to,
  clientName,
  commentText,
  fileName,
  projectName,
  projectUrl,
}: {
  to: string
  clientName: string
  commentText: string
  fileName: string
  projectName: string
  projectUrl: string
}) {
  if (!process.env.RESEND_KEY) return

  const truncated = commentText.length > 200 ? commentText.slice(0, 200) + '...' : commentText

  const html = wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95)">New Comment</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6)">
        <strong style="color:#15f3ec">${clientName}</strong> left a comment on your file.
      </p>

      ${detailsBlock(
        detailRow('Project', projectName) +
        detailRow('File', fileName)
      )}

      <div style="background:rgba(255,255,255,0.04);border-left:3px solid #15f3ec;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);font-style:italic">"${truncated}"</p>
      </div>

      ${ctaButton(projectUrl, 'View Comment')}
  `)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${clientName} commented on ${fileName}`,
      html,
    })
    if (error) console.error('Email error (comment notification):', error)
    return data
  } catch (err) {
    console.error('Failed to send comment notification:', err)
  }
}

// ─── 3. Approval Notification ────────────────────────────────────────────────
export async function sendApprovalNotification({
  to,
  clientName,
  fileName,
  projectName,
  approvedCount,
  totalCount,
  projectUrl,
}: {
  to: string
  clientName: string
  fileName: string
  projectName: string
  approvedCount: number
  totalCount: number
  projectUrl: string
}) {
  if (!process.env.RESEND_KEY) return

  const progressPct = Math.round((approvedCount / totalCount) * 100)

  const html = wrapEmail(`
      <div style="text-align:center;margin-bottom:16px">
        <span style="font-size:40px">&#127881;</span>
      </div>

      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95);text-align:center">File Approved!</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);text-align:center">
        <strong style="color:#15f3ec">${clientName}</strong> approved <strong style="color:rgba(255,255,255,0.9)">${fileName}</strong>
      </p>

      ${detailsBlock(
        detailRow('Project', projectName) +
        detailRow('Progress', `${approvedCount} of ${totalCount} files approved`)
      )}

      <!-- Progress bar -->
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;height:8px;margin-bottom:24px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#15f3ec,#16ffc0);height:100%;width:${progressPct}%;border-radius:8px"></div>
      </div>

      ${ctaButton(projectUrl, 'View Project')}
  `)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${clientName} approved ${fileName}`,
      html,
    })
    if (error) console.error('Email error (approval notification):', error)
    return data
  } catch (err) {
    console.error('Failed to send approval notification:', err)
  }
}

// ─── 4. Changes Requested Notification ───────────────────────────────────────
export async function sendChangesRequestedNotification({
  to,
  clientName,
  fileName,
  projectName,
  projectUrl,
}: {
  to: string
  clientName: string
  fileName: string
  projectName: string
  projectUrl: string
}) {
  if (!process.env.RESEND_KEY) return

  const html = wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95)">Changes Requested</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6)">
        <strong style="color:#15f3ec">${clientName}</strong> has requested changes on a file in your project.
      </p>

      ${detailsBlock(
        detailRow('Project', projectName) +
        detailRow('File', fileName)
      )}

      ${ctaButton(projectUrl, 'Review Feedback')}
  `)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${clientName} requested changes on ${fileName}`,
      html,
    })
    if (error) console.error('Email error (changes requested):', error)
    return data
  } catch (err) {
    console.error('Failed to send changes requested notification:', err)
  }
}

// ─── 5. Project Complete Notification ────────────────────────────────────────
export async function sendProjectCompleteNotification({
  to,
  projectName,
  clientName,
  totalFiles,
  completionDate,
  projectUrl,
}: {
  to: string
  projectName: string
  clientName: string
  totalFiles: number
  completionDate: string
  projectUrl: string
}) {
  if (!process.env.RESEND_KEY) return

  const html = wrapEmail(`
      <div style="text-align:center;margin-bottom:16px">
        <span style="font-size:48px">&#127881;&#127882;&#10024;</span>
      </div>

      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:rgba(255,255,255,0.95);text-align:center">Project Complete!</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);text-align:center">
        Every file in <strong style="color:#15f3ec">${projectName}</strong> has been approved. Time to celebrate!
      </p>

      <!-- Progress bar — 100% -->
      <div style="background:rgba(255,255,255,0.06);border-radius:8px;height:8px;margin-bottom:24px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#15f3ec,#16ffc0);height:100%;width:100%;border-radius:8px"></div>
      </div>

      ${detailsBlock(
        detailRow('Project', projectName) +
        detailRow('Client', clientName) +
        detailRow('Files Approved', `${totalFiles} of ${totalFiles}`) +
        detailRow('Completed', completionDate)
      )}

      ${ctaButton(projectUrl, 'View Project')}
  `)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `\u{1F389} ${projectName} is complete!`,
      html,
    })
    if (error) console.error('Email error (project complete):', error)
    return data
  } catch (err) {
    console.error('Failed to send project complete notification:', err)
  }
}

// ─── 6. Review Ready Notification (sent to client) ──────────────────────────
export async function sendReviewReadyNotification({
  to,
  creatorName,
  projectName,
  reviewUrl,
  fileCount,
}: {
  to: string
  creatorName: string
  projectName: string
  reviewUrl: string
  fileCount: number
}) {
  if (!process.env.RESEND_KEY) return

  const html = wrapEmail(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95)">Ready for Review</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6)">
        <strong style="color:#15f3ec">${creatorName}</strong> shared <strong style="color:rgba(255,255,255,0.9)">${projectName}</strong> for your review.
      </p>

      ${detailsBlock(
        detailRow('Project', projectName) +
        detailRow('Files', `${fileCount} file${fileCount !== 1 ? 's' : ''} ready for review`)
      )}

      ${ctaButton(reviewUrl, 'Start Review')}

      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center">
        You can approve files, request changes, and leave comments directly in WrkFlo.
      </p>
  `)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${creatorName} shared ${projectName} for your review`,
      html,
    })
    if (error) console.error('Email error (review ready):', error)
    return data
  } catch (err) {
    console.error('Failed to send review ready notification:', err)
  }
}

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

// Until you verify a custom domain in Resend, emails send from onboarding@resend.dev
// Once verified, change this to e.g. noreply@wrkflo.app
const FROM_EMAIL = 'WrkFlo <noreply@wrkflo.us>'

export async function sendClientInviteEmail({
  to,
  creatorName,
  projectNames,
  loginUrl,
}: {
  to: string
  creatorName: string
  projectNames?: string[]
  loginUrl: string
}) {
  const projectList = projectNames && projectNames.length > 0
    ? projectNames.map(n => `<li style="padding:4px 0;color:rgba(255,255,255,0.8)">${n}</li>`).join('')
    : ''

  const html = `
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

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0">
        <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#15f3ec,#16ffc0);color:#0a0a0f;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 20px rgba(21,243,236,0.3)">
          Sign In to Review
        </a>
      </div>

      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center">
        You'll be asked to create an account or sign in if you already have one.
      </p>
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

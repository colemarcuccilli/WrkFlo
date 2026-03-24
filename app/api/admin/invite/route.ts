import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { Resend } from 'resend'

export const dynamic = "force-dynamic"

const resend = new Resend(process.env.RESEND_KEY)

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceClient()
    const { data, error } = await service
      .from('beta_invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Admin invite list error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, role } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Check if already invited
    const { data: existing } = await service
      .from('beta_invites')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already invited' }, { status: 409 })
    }

    // Insert invite
    const { data: invite, error } = await service
      .from('beta_invites')
      .insert({
        email: email.toLowerCase(),
        invited_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Send branded invite email
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://wrkflo.us'
    const joinUrl = `${appUrl}/join?email=${encodeURIComponent(email)}&role=creator&beta=true`

    if (process.env.RESEND_KEY) {
      await resend.emails.send({
        from: 'WrkFlo <noreply@wrkflo.us>',
        to: email,
        subject: "You're invited to the WrkFlo beta!",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#15f3ec,#16ffc0);text-align:center;line-height:48px">
        <span style="font-size:24px;color:#0a0a0f;font-weight:bold">W</span>
      </div>
      <div style="margin-top:12px">
        <span style="font-size:22px;font-weight:700;background:linear-gradient(135deg,#15f3ec,#16ffc0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">WrkFlo</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;backdrop-filter:blur(12px)">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:rgba(255,255,255,0.95)">You're Invited to the Beta!</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6)">
        You've been hand-picked to try <strong style="color:#15f3ec">WrkFlo</strong> — the creative review platform that makes client feedback effortless.
      </p>
      <div style="background:rgba(21,243,236,0.06);border:1px solid rgba(21,243,236,0.12);border-radius:12px;padding:16px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 12px 6px 0;font-size:13px;color:rgba(255,255,255,0.4);white-space:nowrap">Role</td>
            <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.8)">Creator (Full Access)</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;font-size:13px;color:rgba(255,255,255,0.4);white-space:nowrap">Access</td>
            <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.8)">Enterprise — Free Forever (Beta)</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="${joinUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#15f3ec,#16ffc0);color:#0a0a0f;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 20px rgba(21,243,236,0.3)">
          Join WrkFlo Beta
        </a>
      </div>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.35);text-align:center">
        Click the button above to create your account and start using WrkFlo.
      </p>
    </div>
    <div style="text-align:center;margin-top:32px">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25)">
        Sent via <span style="color:#15f3ec">WrkFlo</span> — creative review, simplified.
      </p>
    </div>
  </div>
</body>
</html>`,
      })
    }

    return NextResponse.json(invite)
  } catch (err: any) {
    console.error('Admin invite error:', err)
    // Log error to activity_log so admins see it
    try {
      const service = createServiceClient()
      await service.from('activity_log').insert({
        user_email: 'system',
        action: 'invite_error',
        category: 'error',
        metadata: { error: err.message || String(err) },
      })
    } catch {}
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

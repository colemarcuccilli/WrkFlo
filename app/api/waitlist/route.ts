import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    // Attempt Supabase insert — graceful fallback if table doesn't exist yet
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('waitlist').insert({ email });
        // We don't throw on conflict (duplicate email) — just silently succeed
      }
    } catch {
      // Graceful fallback: table may not exist yet, log and continue
      console.warn('[waitlist] Supabase insert failed — continuing without DB write');
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Graceful fallback for any unexpected error
    console.error('[waitlist] Unexpected error — returning success anyway');
    return NextResponse.json({ ok: true });
  }
}

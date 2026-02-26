import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST() {
  const supabase = createServiceClient()

  const queries = [
    `ALTER TABLE public.files ADD COLUMN IF NOT EXISTS current_round int DEFAULT 1`,
    `ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS revision_round int DEFAULT 1`,
  ]

  const results: string[] = []
  for (const sql of queries) {
    const { error } = await supabase.rpc('exec_sql', { sql }).single()
    if (error) {
      // Try raw query via REST
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      )
      if (!res.ok) {
        results.push(`WARN: ${sql} — may need manual run`)
      } else {
        results.push(`OK: ${sql}`)
      }
    } else {
      results.push(`OK: ${sql}`)
    }
  }

  return NextResponse.json({ results, manual_sql: queries.join(';\n') })
}

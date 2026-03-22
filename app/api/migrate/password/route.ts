import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()

  const migrations = [
    `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS review_password text`,
  ]

  const results = []
  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).single()
    if (error) {
      results.push({ sql: sql.slice(0, 60), error: error.message })
    } else {
      results.push({ sql: sql.slice(0, 60), ok: true })
    }
  }

  return NextResponse.json({ results })
}

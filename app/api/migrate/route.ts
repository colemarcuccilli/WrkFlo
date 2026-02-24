import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Run schema migrations to add new columns
export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  
  const migrations = [
    // Add description to projects
    `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description text`,
    // Add due_date to projects
    `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS due_date date`,
    // Add creator_name to projects (denormalized for performance)
    `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS creator_name text DEFAULT 'Creator'`,
  ]

  const results = []
  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).single()
    if (error) {
      // Try direct SQL - may not work with anon RPC, just log
      results.push({ sql: sql.slice(0, 50), error: error.message })
    } else {
      results.push({ sql: sql.slice(0, 50), ok: true })
    }
  }

  return NextResponse.json({ results })
}

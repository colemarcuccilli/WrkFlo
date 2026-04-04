import { createServiceClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      category,
      description,
      url,
      browser_info,
      viewport,
      user_email,
      user_id,
      metadata,
    } = body

    if (!category || !description) {
      return NextResponse.json(
        { error: 'Category and description are required.' },
        { status: 400 }
      )
    }

    if (typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters.' },
        { status: 400 }
      )
    }

    // Use service client so unauthenticated review page users can also submit reports
    const supabase = createServiceClient()

    const { data, error } = await supabase.from('bug_reports').insert({
      category,
      description: description.trim(),
      url: url || null,
      browser_info: browser_info || null,
      viewport: viewport || null,
      user_email: user_email || null,
      user_id: user_id || null,
      metadata: metadata || {},
      status: 'new',
    }).select().single()

    if (error) {
      console.error('[bug_reports] Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save report.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('[bug_reports] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[bug_reports] Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reports: data })
  } catch (err) {
    console.error('[bug_reports] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

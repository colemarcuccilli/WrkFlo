import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, user_email, prompt_type, rating, feedback, metadata } = body

    if (!prompt_type) {
      return NextResponse.json({ error: 'Prompt type required' }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service.from('feedback_responses').insert({
      user_id: user_id || null,
      user_email: user_email || null,
      prompt_type,
      rating: rating || null,
      feedback: feedback || null,
      metadata: metadata || {},
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Feedback error:', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  
  // Get project counts by status
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, created_at')
  
  // Get file counts
  const { data: files } = await supabase
    .from('files')
    .select('id, status, created_at')
  
  // Get comment counts
  const { data: comments } = await supabase
    .from('comments')
    .select('id, created_at')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: (projects || []).filter(p => p.status === 'In Review' || p.status === 'Changes Requested').length,
    completedProjects: (projects || []).filter(p => p.status === 'Approved').length,
    totalFiles: files?.length || 0,
    approvedFiles: (files || []).filter(f => f.status === 'approved').length,
    totalComments: comments?.length || 0,
    deliverableThisMonth: (files || []).filter(f => new Date(f.created_at) >= monthStart).length,
  }

  return NextResponse.json(stats)
}

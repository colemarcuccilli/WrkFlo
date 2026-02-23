export async function fetchProjects() {
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export async function fetchProjectById(id: string) {
  const res = await fetch(`/api/projects/${id}`)
  if (!res.ok) throw new Error('Project not found')
  return res.json()
}

export async function fetchProjectByToken(token: string) {
  const res = await fetch(`/api/review/${token}`)
  if (!res.ok) throw new Error('Review not found')
  return res.json()
}

export async function updateFileStatus(fileId: string, status: string) {
  const res = await fetch(`/api/files/${fileId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update status')
  return res.json()
}

export async function addComment(data: {
  file_id: string
  author_name: string
  author_role: string
  content: string
  timestamp_data?: any
  author_id?: string
}) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to add comment')
  return res.json()
}

export function normaliseProject(dbProject: any) {
  if (!dbProject) return null
  return {
    id: dbProject.id,
    name: dbProject.name,
    client: dbProject.client_name || 'Unknown',
    status: dbProject.status,
    createdAt: dbProject.created_at?.split('T')[0] || '',
    lastActivity: new Date(dbProject.updated_at || dbProject.created_at).toLocaleDateString(),
    reviewToken: dbProject.review_token,
    creatorName: dbProject.creator_name || 'Creator',
    files: (dbProject.files || []).map(normaliseFile),
  }
}

export function normaliseFile(f: any) {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    version: f.version,
    status: f.status,
    uploadDate: f.upload_date || '',
    url: f.url || null,
    duration: f.duration || null,
    versions: (f.file_versions || []).map((v: any) => ({
      version: v.version_label,
      date: v.created_at?.split('T')[0] || '',
      notes: v.notes || '',
    })),
    comments: (f.comments || []).map((c: any) => ({
      id: c.id,
      author: c.author_name,
      authorRole: c.author_role,
      content: c.content,
      timestamp: c.timestamp_data,
      createdAt: new Date(c.created_at).toLocaleString(),
    })),
  }
}

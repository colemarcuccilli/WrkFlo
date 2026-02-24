import { NextRequest, NextResponse } from 'next/server'

function ruleBasedSummary(comments: any[], projectName: string): string {
  if (!comments || comments.length === 0) {
    return `No feedback has been left on ${projectName} yet.`
  }

  const clientComments = comments.filter((c) => c.authorRole === 'client' || c.author_role === 'client')
  const byFile: Record<string, string[]> = {}

  for (const c of clientComments) {
    const fileName = c.fileName || 'General'
    if (!byFile[fileName]) byFile[fileName] = []
    byFile[fileName].push(c.content)
  }

  const fileCount = Object.keys(byFile).length
  const totalComments = clientComments.length

  if (totalComments === 0) {
    return `No client feedback on ${projectName} yet. The team has left ${comments.length} internal note${comments.length !== 1 ? 's' : ''}.`
  }

  let summary = `**${projectName} — Client Feedback Summary**\n\n`
  summary += `${totalComments} client comment${totalComments !== 1 ? 's' : ''} across ${fileCount} file${fileCount !== 1 ? 's' : ''}.\n\n`

  for (const [file, msgs] of Object.entries(byFile)) {
    summary += `**${file}:**\n`
    msgs.forEach((m, i) => {
      summary += `${i + 1}. ${m}\n`
    })
    summary += '\n'
  }

  return summary.trim()
}

export async function POST(req: NextRequest) {
  const { comments, projectName } = await req.json()

  // Try Claude/OpenAI if key exists
  const openrouterKey = process.env.OPENROUTER_API_KEY
  
  if (openrouterKey && comments && comments.length > 0) {
    try {
      const commentText = comments
        .filter((c: any) => c.authorRole === 'client' || c.author_role === 'client')
        .map((c: any) => `[${c.fileName || 'File'}] ${c.author || c.author_name}: ${c.content}`)
        .join('\n')

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'user',
              content: `You are a creative project manager summarizing client feedback for a creator. Be concise and actionable. Format as bullet points grouped by theme.\n\nProject: ${projectName}\n\nClient Comments:\n${commentText}\n\nSummarize the key feedback in 3-5 bullet points:`
            }
          ],
          max_tokens: 300,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiSummary = data.choices?.[0]?.message?.content
        if (aiSummary) {
          return NextResponse.json({ summary: aiSummary, aiGenerated: true })
        }
      }
    } catch (e) {
      // Fall through to rule-based
    }
  }

  // Rule-based fallback
  const summary = ruleBasedSummary(comments, projectName)
  return NextResponse.json({ summary, aiGenerated: false })
}

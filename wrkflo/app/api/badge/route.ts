import { NextRequest, NextResponse } from 'next/server'

// Generate an SVG "Client Approved" badge for download
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fileName = searchParams.get('fileName') || 'File'
  const clientName = searchParams.get('clientName') || 'Client'
  const date = searchParams.get('date') || new Date().toLocaleDateString()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="120" rx="12" fill="url(#bg)"/>
  
  <!-- White inner card -->
  <rect x="12" y="12" width="376" height="96" rx="8" fill="white" opacity="0.12"/>
  
  <!-- Check circle -->
  <circle cx="55" cy="60" r="24" fill="white" opacity="0.2"/>
  <circle cx="55" cy="60" r="20" fill="none" stroke="white" stroke-width="2.5"/>
  <polyline points="44,60 52,68 66,52" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Title -->
  <text x="94" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="white">CLIENT APPROVED</text>
  
  <!-- File name -->
  <text x="94" y="66" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">${fileName.slice(0, 28)}${fileName.length > 28 ? '…' : ''}</text>
  
  <!-- Client + date -->
  <text x="94" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="white" opacity="0.85">Approved by ${clientName} · ${date}</text>
  
  <!-- WrkFlo brand -->
  <text x="370" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="white" opacity="0.6" text-anchor="end">WrkFlo</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="approved-badge-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.svg"`,
      'Cache-Control': 'no-store',
    },
  })
}

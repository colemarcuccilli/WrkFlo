import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
}

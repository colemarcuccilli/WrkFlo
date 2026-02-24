import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect('https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a9/Tromboon-sample.ogg/Tromboon-sample.ogg.mp3')
}

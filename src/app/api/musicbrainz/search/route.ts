import { NextRequest, NextResponse } from 'next/server'
import { searchRecordings } from '@/features/musicbrainz/musicbrainz.service'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? ''
  const album = searchParams.get('album') ?? ''

  if (!title && !album) {
    return NextResponse.json({ success: false, error: 'title or album is required' }, { status: 400 })
  }

  try {
    const data = await searchRecordings({ title, album })
    return NextResponse.json({ success: true, recordings: data.recordings })
  } catch {
    return NextResponse.json({ success: false, error: 'MusicBrainz search failed' }, { status: 502 })
  }
}

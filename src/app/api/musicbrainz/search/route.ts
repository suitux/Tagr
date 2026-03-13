import { NextRequest, NextResponse } from 'next/server'
import { searchRecordings } from '@/features/musicbrainz/musicbrainz.service'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = getSearchParam(searchParams, 'title', 'string', '')
  const album = getSearchParam(searchParams, 'album', 'string', '')

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

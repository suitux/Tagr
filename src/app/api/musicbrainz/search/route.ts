import { NextRequest, NextResponse } from 'next/server'
import { MUSICBRAINZ_SEARCH_MAX_LIMIT, MUSICBRAINZ_SEARCH_PAGE_SIZE } from '@/features/musicbrainz/domain'
import { searchRecordings } from '@/features/musicbrainz/musicbrainz.service'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = getSearchParam(searchParams, 'title', 'string', '')
  const artist = getSearchParam(searchParams, 'artist', 'string', '')
  const album = getSearchParam(searchParams, 'album', 'string', '')
  const mbid = getSearchParam(searchParams, 'mbid', 'string', '')
  const year = getSearchParam(searchParams, 'year', 'number')
  const limit = getSearchParam(searchParams, 'limit', 'number', MUSICBRAINZ_SEARCH_PAGE_SIZE)
  const offset = Math.max(getSearchParam(searchParams, 'offset', 'number', 0), 0)

  if (!title && !artist && !album && !mbid && !year) {
    return NextResponse.json(
      { success: false, error: 'one of title, artist, album, year or mbid is required' },
      { status: 400 }
    )
  }

  try {
    const data = await searchRecordings({
      title,
      artist,
      album,
      year,
      mbid,
      limit: Math.min(Math.max(limit, 1), MUSICBRAINZ_SEARCH_MAX_LIMIT),
      offset
    })
    return NextResponse.json({
      success: true,
      recordings: data.recordings,
      count: data.count ?? data.recordings.length,
      offset: data.offset ?? offset
    })
  } catch {
    return NextResponse.json({ success: false, error: 'MusicBrainz search failed' }, { status: 502 })
  }
}

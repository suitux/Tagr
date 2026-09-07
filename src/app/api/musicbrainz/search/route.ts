import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_MUSICBRAINZ_MATCH_MODE,
  MUSICBRAINZ_MATCH_MODES,
  MUSICBRAINZ_SEARCH_MAX_LIMIT,
  MUSICBRAINZ_SEARCH_PAGE_SIZE,
  type MusicBrainzMatchMode
} from '@/features/musicbrainz/domain'
import { searchRecordings } from '@/features/musicbrainz/musicbrainz.service'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = getSearchParam(searchParams, 'title', 'string', '')
  const artist = getSearchParam(searchParams, 'artist', 'string', '')
  const album = getSearchParam(searchParams, 'album', 'string', '')
  const mbid = getSearchParam(searchParams, 'mbid', 'string', '')
  const year = getSearchParam(searchParams, 'year', 'number')
  const match = getSearchParam(searchParams, 'match', 'string', DEFAULT_MUSICBRAINZ_MATCH_MODE)
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
      matchMode: MUSICBRAINZ_MATCH_MODES.includes(match as MusicBrainzMatchMode)
        ? (match as MusicBrainzMatchMode)
        : DEFAULT_MUSICBRAINZ_MATCH_MODE,
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

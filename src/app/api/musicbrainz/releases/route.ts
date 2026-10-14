import { NextRequest, NextResponse } from 'next/server'
import { MUSICBRAINZ_SEARCH_MAX_LIMIT, MUSICBRAINZ_SEARCH_PAGE_SIZE } from '@/features/musicbrainz/domain'
import { searchReleases } from '@/features/musicbrainz/musicbrainz.service'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const album = getSearchParam(searchParams, 'album', 'string', '')
  const artist = getSearchParam(searchParams, 'artist', 'string', '')
  const limit = getSearchParam(searchParams, 'limit', 'number', MUSICBRAINZ_SEARCH_PAGE_SIZE)
  const offset = Math.max(getSearchParam(searchParams, 'offset', 'number', 0), 0)

  if (!album.trim() && !artist.trim()) {
    return NextResponse.json({ success: false, error: 'album or artist is required' }, { status: 400 })
  }

  try {
    const data = await searchReleases({
      album,
      artist,
      limit: Math.min(Math.max(limit, 1), MUSICBRAINZ_SEARCH_MAX_LIMIT),
      offset
    })
    return NextResponse.json({
      success: true,
      releases: data.releases ?? [],
      count: data.count ?? data.releases?.length ?? 0,
      offset: data.offset ?? offset
    })
  } catch {
    return NextResponse.json({ success: false, error: 'MusicBrainz search failed' }, { status: 502 })
  }
}

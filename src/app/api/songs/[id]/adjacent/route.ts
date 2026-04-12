import { NextResponse } from 'next/server'
import { getAdjacentSongs } from '@/features/metadata/metadata-scan.service'
import { parseSmartListRules } from '@/features/smart-playlists/helpers'
import { buildSmartPlaylistWhere } from '@/features/smart-playlists/smart-playlist-query.service'
import { ColumnField, Song, SongSortDirection } from '@/features/songs/domain'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { getSongFiltersFromSearchParams } from '@/features/songs/filters-helpers'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { getSearchParam } from '@/lib/api/search-params'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

interface AdjacentSuccessResponse {
  success: true
  previous: Song | null
  next: Song | null
}

interface AdjacentErrorResponse {
  success: false
  error: string
}

type AdjacentResponse = AdjacentSuccessResponse | AdjacentErrorResponse

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse<AdjacentResponse>> {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const folderPathParam = getSearchParam(searchParams, 'folderPath', 'string')
  const folderPath = folderPathParam && folderPathParam !== ALL_SONGS_FOLDER_ID ? folderPathParam : null

  const smartPlaylistIdParam = getSearchParam(searchParams, 'smartPlaylistId', 'number')

  const search = getSearchParam(searchParams, 'search', 'string', '') || undefined
  const sortFieldParam = getSearchParam(searchParams, 'sortField', 'string', 'title') as ColumnField | ''
  const sortParam = getSearchParam(searchParams, 'sort', 'string', 'asc') as SongSortDirection | ''

  const { filters, hasFilters } = getSongFiltersFromSearchParams(searchParams)

  let extraWhere: Record<string, unknown> | undefined

  if (smartPlaylistIdParam) {
    const playlist = await prisma.smartPlaylist.findUnique({ where: { id: smartPlaylistIdParam } })
    if (playlist) {
      const rules = parseSmartListRules(playlist.rules)
      extraWhere = buildSmartPlaylistWhere(rules) ?? undefined
    }
  }

  try {
    const { previous, next } = await getAdjacentSongs(
      songId,
      folderPath,
      search,
      sortFieldParam || undefined,
      sortParam || undefined,
      hasFilters ? filters : undefined,
      extraWhere
    )

    return NextResponse.json({ success: true, previous, next })
  } catch (error) {
    console.error('Error fetching adjacent songs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching adjacent songs'
      },
      { status: 500 }
    )
  }
}

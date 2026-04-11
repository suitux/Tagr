import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { countSongsByPlaylist, getSongsByPlaylist, PAGE_SIZE } from '@/features/metadata/metadata-scan.service'
import { parseRules } from '@/features/smart-playlists/domain'
import { ColumnField, Song, SongColumnFilters, SongSortDirection } from '@/features/songs/domain'
import { getSongFiltersFromSearchParams } from '@/features/songs/filters-helpers'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { getSearchParam } from '@/lib/api/search-params'

interface SongsSuccessResponse {
  success: true
  playlistId: number
  totalFiles: number
  files: Song[]
}

interface SongsErrorResponse {
  success: false
  error: string
}

type SongsResponse = SongsSuccessResponse | SongsErrorResponse

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SongsResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const numericId = Number(id)
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid playlist ID' }, { status: 400 })
  }

  const playlist = await prisma.smartPlaylist.findUnique({ where: { id: numericId } })
  if (!playlist) {
    return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
  }
  if (playlist.userId !== userId && !playlist.isPublic) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const rules = parseRules(playlist.rules)

  const { searchParams } = new URL(request.url)
  const search = getSearchParam(searchParams, 'search', 'string', '') || undefined
  const sortFieldParam = getSearchParam(searchParams, 'sortField', 'string', 'title') as ColumnField
  const sortParam = getSearchParam(searchParams, 'sort', 'string', 'asc') as SongSortDirection
  const limit = getSearchParam(searchParams, 'limit', 'number', PAGE_SIZE)
  const offset = getSearchParam(searchParams, 'offset', 'number', 0)

  const metadataKeysParam = getSearchParam(searchParams, 'metadataKeys', 'string', '') || undefined
  const metadataKeys = metadataKeysParam ? metadataKeysParam.split(',').filter(Boolean) : undefined

  const { filters, hasFilters } = getSongFiltersFromSearchParams(searchParams)

  try {
    const [songs, totalFiles] = await Promise.all([
      getSongsByPlaylist(
        rules,
        search,
        sortFieldParam,
        sortParam,
        offset,
        limit,
        hasFilters ? filters : undefined,
        metadataKeys
      ),
      countSongsByPlaylist(rules, search, hasFilters ? filters : undefined)
    ])

    return NextResponse.json({
      success: true,
      playlistId: numericId,
      totalFiles,
      files: songs
    })
  } catch (error) {
    console.error('Error fetching smart playlist songs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching playlist songs'
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addSongsToPlaylist, findPlaylistById } from '@/features/playlists/playlists.repository'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { ColumnField, Song, SongSortDirection } from '@/features/songs/domain'
import { getSongFiltersFromSearchParams } from '@/features/songs/filters-helpers'
import { countSongsByCustomPlaylist, getSongsByCustomPlaylist, PAGE_SIZE } from '@/features/songs/song-query.repository'
import { getSearchParam } from '@/lib/api/search-params'

interface SongsSuccessResponse {
  success: true
  playlistId: number
  totalFiles: number
  files: Song[]
}

interface AddResponse {
  success: true
  added: number
}

interface ErrorResponse {
  success: false
  error: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SongsSuccessResponse | ErrorResponse>> {
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

  const playlist = await findPlaylistById(numericId)
  if (!playlist) {
    return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
  }
  if (playlist.userId !== userId && !playlist.isPublic) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = getSearchParam(searchParams, 'search', 'string', '') || undefined
  // Empty sortField => preserve manual playlist order (sortIndex).
  const sortFieldParam = (getSearchParam(searchParams, 'sortField', 'string', '') as ColumnField) || undefined
  const sortParam = (getSearchParam(searchParams, 'sort', 'string', '') as SongSortDirection) || undefined
  const limit = getSearchParam(searchParams, 'limit', 'number', PAGE_SIZE)
  const offset = getSearchParam(searchParams, 'offset', 'number', 0)

  const metadataKeysParam = getSearchParam(searchParams, 'metadataKeys', 'string', '') || undefined
  const metadataKeys = metadataKeysParam ? metadataKeysParam.split(',').filter(Boolean) : undefined

  const { filters, hasFilters } = getSongFiltersFromSearchParams(searchParams)

  try {
    const [songs, totalFiles] = await Promise.all([
      getSongsByCustomPlaylist(
        numericId,
        search,
        sortFieldParam,
        sortParam,
        offset,
        limit,
        hasFilters ? filters : undefined,
        metadataKeys
      ),
      countSongsByCustomPlaylist(numericId, search, hasFilters ? filters : undefined)
    ])

    return NextResponse.json({
      success: true,
      playlistId: numericId,
      totalFiles,
      files: songs
    })
  } catch (error) {
    console.error('Error fetching playlist songs:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error fetching playlist songs' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AddResponse | ErrorResponse>> {
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

  const playlist = await findPlaylistById(numericId)
  if (!playlist) {
    return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
  }
  if (playlist.userId !== userId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { target } = body as { target?: BulkTarget }
    if (!target) {
      return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
    }

    const songIds = await resolveBulkTargetIds(target, { userId })
    const added = await addSongsToPlaylist(numericId, songIds)

    return NextResponse.json({ success: true, added })
  } catch (error) {
    if (error instanceof BulkResolveError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    console.error('Error adding songs to playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

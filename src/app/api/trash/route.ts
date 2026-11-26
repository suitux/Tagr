import { NextResponse } from 'next/server'
import { ColumnField, Song, SongSortDirection } from '@/features/songs/domain'
import { getSongFiltersFromSearchParams } from '@/features/songs/filters-helpers'
import { countTrashedSongs, getTrashedSongs, PAGE_SIZE } from '@/features/songs/song-query.repository'
import {
  deleteSongPermanently,
  getAllTrashedSongIds,
  moveSongToTrash,
  runTrashMaintenance
} from '@/features/trash/trash.service'
import { requireRole } from '@/lib/api/auth-guard'
import { getSearchParam } from '@/lib/api/search-params'
import { streamTrashOperation } from './helpers'

interface TrashSuccessResponse {
  success: true
  totalFiles: number
  files: Song[]
}

interface TrashErrorResponse {
  success: false
  error: string
}

type TrashResponse = TrashSuccessResponse | TrashErrorResponse

/** The songs in the trash, with the same search / sort / filter / paging params as `/api/songs`. */
export async function GET(request: Request): Promise<NextResponse<TrashResponse>> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { searchParams } = new URL(request.url)
  const search = getSearchParam(searchParams, 'search', 'string', '') || undefined
  const sortField = getSearchParam(searchParams, 'sortField', 'string', 'title') as ColumnField
  const sort = getSearchParam(searchParams, 'sort', 'string', 'asc') as SongSortDirection
  const limit = getSearchParam(searchParams, 'limit', 'number', PAGE_SIZE)
  const offset = getSearchParam(searchParams, 'offset', 'number', 0)

  const metadataKeysParam = getSearchParam(searchParams, 'metadataKeys', 'string', '') || undefined
  const metadataKeys = metadataKeysParam ? metadataKeysParam.split(',').filter(Boolean) : undefined

  const { filters, hasFilters } = getSongFiltersFromSearchParams(searchParams)
  const activeFilters = hasFilters ? filters : undefined

  try {
    // Opening the trash is one of the moments it tidies itself, so the first page never lists a song
    // that already expired or whose file is gone.
    if (offset === 0) await runTrashMaintenance()

    const [files, totalFiles] = await Promise.all([
      getTrashedSongs(search, sortField, sort, offset, limit, activeFilters, metadataKeys),
      countTrashedSongs(search, activeFilters)
    ])

    return NextResponse.json({ success: true, totalFiles, files })
  } catch (error) {
    console.error('Error fetching trashed songs:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error fetching trash' },
      { status: 500 }
    )
  }
}

/** Moves the target songs to the trash, then purges whatever outlived the retention period. */
export async function POST(request: Request): Promise<Response> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  return streamTrashOperation(request, moveSongToTrash, {
    userId: guard.session.user?.id,
    after: runTrashMaintenance
  })
}

/** Deletes the target trashed songs for good; without a target, empties the whole trash. Admin only: it cannot be undone. */
export async function DELETE(request: Request): Promise<Response> {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  return streamTrashOperation(request, deleteSongPermanently, {
    userId: guard.session.user?.id,
    fallbackIds: getAllTrashedSongIds
  })
}

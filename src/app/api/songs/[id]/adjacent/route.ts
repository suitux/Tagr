import { NextResponse } from 'next/server'
import { getAdjacentSongs } from '@/features/metadata/metadata-scan.service'
import { Song, SongColumnFilters, SongSortDirection, SongSortField } from '@/features/songs/domain'
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
  const folderPath = searchParams.get('folderPath')

  if (!folderPath) {
    return NextResponse.json({ success: false, error: 'folderPath is required' }, { status: 400 })
  }

  const search = getSearchParam(searchParams, 'search', 'string', '') || undefined
  const sortFieldParam = getSearchParam(searchParams, 'sortField', 'string', 'title') as SongSortField | ''
  const sortParam = getSearchParam(searchParams, 'sort', 'string', 'asc') as SongSortDirection | ''

  const filters: SongColumnFilters = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.') && value) {
      const field = key.slice(7) as SongSortField
      filters[field] = value
    }
  }
  const hasFilters = Object.keys(filters).length > 0

  try {
    const { previous, next } = await getAdjacentSongs(
      songId,
      folderPath,
      search,
      sortFieldParam || undefined,
      sortParam || undefined,
      hasFilters ? filters : undefined
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

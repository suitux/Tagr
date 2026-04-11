import { NextResponse } from 'next/server'
import { getSongsByFolder, countSongsByFolder, PAGE_SIZE } from '@/features/metadata/metadata-scan.service'
import { ColumnField, Song, SongColumnFilters, SongSortDirection } from '@/features/songs/domain'
import { getSongFiltersFromSearchParams } from '@/features/songs/filters-helpers'
import { getSearchParam } from '@/lib/api/search-params'

interface RouteParams {
  params: Promise<{
    path?: string[]
  }>
}

interface FilesSuccessResponse {
  success: true
  folderPath: string
  totalFiles: number
  files: Song[]
}

interface FilesErrorResponse {
  success: false
  error: string
}

type FilesResponse = FilesSuccessResponse | FilesErrorResponse

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse<FilesResponse>> {
  const { path } = await params

  const folderPath = !!path?.length ? '/' + path.map(segment => decodeURIComponent(segment)).join('/') : null
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
      getSongsByFolder(
        folderPath,
        search,
        sortFieldParam,
        sortParam,
        offset,
        limit,
        hasFilters ? filters : undefined,
        metadataKeys
      ),
      countSongsByFolder(folderPath, search, hasFilters ? filters : undefined)
    ])

    return NextResponse.json({
      success: true,
      folderPath: folderPath ?? 'all',
      totalFiles,
      files: songs
    })
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching songs'
      },
      { status: 500 }
    )
  }
}

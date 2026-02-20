import { NextResponse } from 'next/server'
import { Song, SongSortField, SongSortDirection } from '@/features/songs/domain'
import { getSongsByFolder, countSongsByFolder, PAGE_SIZE } from '@/lib/db/scanner'

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

  if (!path || path.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Folder path is required. Use /api/folders/songs/path/to/folder'
      },
      { status: 400 }
    )
  }

  const folderPath = '/' + path.map(segment => decodeURIComponent(segment)).join('/')
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const sortFieldParam = (url.searchParams.get('sortField') as SongSortField) ?? undefined
  const sortParam = (url.searchParams.get('sort') as SongSortDirection) ?? undefined
  const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : PAGE_SIZE
  const offset = url.searchParams.has('offset') ? Number(url.searchParams.get('offset')) : 0

  try {
    const [songs, totalFiles] = await Promise.all([
      getSongsByFolder(folderPath, search, sortFieldParam, sortParam, offset, limit),
      countSongsByFolder(folderPath, search)
    ])

    return NextResponse.json({
      success: true,
      folderPath,
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

import { NextResponse } from 'next/server'
import { Song } from '@/features/songs/domain'
import { getSongsByFolder } from '@/lib/db/scanner'

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
  const search = new URL(request.url).searchParams.get('search') ?? undefined

  try {
    const songs = await getSongsByFolder(folderPath, search)

    return NextResponse.json({
      success: true,
      folderPath,
      totalFiles: songs.length,
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

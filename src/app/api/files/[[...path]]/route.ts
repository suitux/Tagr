import { NextResponse } from 'next/server'
import { getSongsByFolder } from '@/lib/db/scanner'

interface RouteParams {
  params: Promise<{
    path?: string[]
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { path } = await params

  if (!path || path.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Folder path is required. Use /api/folders/files/path/to/folder'
      },
      { status: 400 }
    )
  }

  // Reconstruir la ruta completa desde los segmentos
  const folderPath = '/' + path.map(segment => decodeURIComponent(segment)).join('/')

  try {
    const songs = await getSongsByFolder(folderPath)

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


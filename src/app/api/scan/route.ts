import { NextResponse } from 'next/server'
import { adaptScanResultResponse } from '@/features/metadata/adapters'
import { scanAllFoldersAndUpdateDatabase } from '@/features/metadata/metadata-scan.service'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { analyzeDatabase, optimizeSQLite } from '@/infrastructure/prisma/optimize'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') === 'quick' ? 'quick' : 'full'
  const folders = getMusicFolders()

  if (folders.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'No music folders configured. Set the MUSIC_FOLDERS environment variable.'
      },
      { status: 400 }
    )
  }

  try {
    await optimizeSQLite()

    const result = await scanAllFoldersAndUpdateDatabase(folders, undefined, mode)

    await analyzeDatabase()

    return NextResponse.json({
      success: true,
      result: adaptScanResultResponse(result)
    })
  } catch (error) {
    console.error('Error during scan:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during scan'
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { adaptScanResultResponse } from '@/features/metadata/adapters'
import { scanAllFoldersAndUpdateDatabase } from '@/features/metadata/metadata-scan.service'
import { ScanMode } from '@/features/scan/domain'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { analyzeDatabase, optimizeSQLite } from '@/infrastructure/prisma/optimize'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: Request) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { searchParams } = new URL(request.url)
  const mode = getSearchParam(searchParams, 'mode', 'string', 'full') as ScanMode
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

import { NextResponse } from 'next/server'
import { scanAllFoldersAndUpdateDatabase } from '@/features/metadata/metadata-scan.service'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { analyzeDatabase, optimizeSQLite } from '@/infrastructure/prisma/optimize'

export async function GET() {
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
    // Optimizar SQLite antes del scan
    await optimizeSQLite()

    // Ejecutar el scan
    const result = await scanAllFoldersAndUpdateDatabase(folders)

    // Analizar la base de datos después del scan para optimizar queries
    await analyzeDatabase()

    return NextResponse.json({
      success: true,
      result
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

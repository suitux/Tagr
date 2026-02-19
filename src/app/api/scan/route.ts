import { NextResponse } from 'next/server'
import { getMusicFolders } from '@/lib/config'
import { analyzeDatabase, optimizeSQLite } from '@/lib/db/optimize'
import { scanAllFolders } from '@/lib/db/scanner'

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
    const result = await scanAllFolders(folders)

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

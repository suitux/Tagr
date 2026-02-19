import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getMusicFolders, isMusicExtension } from '@/lib/config'

export interface MusicFile {
  name: string
  path: string
  extension: string
  size: number
  modifiedAt: string
}

export interface FolderContent {
  folder: string
  files: MusicFile[]
  error?: string
}

/**
 * Verifica si un archivo es un archivo de música basándose en su extensión
 */
function isMusicFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return isMusicExtension(ext)
}

/**
 * Lee los archivos de música de una carpeta
 */
async function readMusicFolder(folderPath: string): Promise<FolderContent> {
  try {
    const stats = await fs.stat(folderPath)
    if (!stats.isDirectory()) {
      return {
        folder: folderPath,
        files: [],
        error: 'La ruta no es un directorio'
      }
    }

    const entries = await fs.readdir(folderPath, { withFileTypes: true })
    const musicFiles: MusicFile[] = []

    for (const entry of entries) {
      if (entry.isFile() && isMusicFile(entry.name)) {
        const filePath = path.join(folderPath, entry.name)
        const fileStats = await fs.stat(filePath)

        musicFiles.push({
          name: entry.name,
          path: filePath,
          extension: path.extname(entry.name).toLowerCase(),
          size: fileStats.size,
          modifiedAt: fileStats.mtime.toISOString()
        })
      }
    }

    return {
      folder: folderPath,
      files: musicFiles.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    return {
      folder: folderPath,
      files: [],
      error: error instanceof Error ? error.message : 'Error desconocido al leer la carpeta'
    }
  }
}

/**
 * GET /api/folders
 * Devuelve el listado de carpetas configuradas y sus archivos de música
 */
export async function GET() {
  const folders = getMusicFolders()

  if (folders.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'No hay carpetas de música configuradas. Configure la variable de entorno MUSIC_FOLDERS.',
        folders: []
      },
      { status: 400 }
    )
  }

  const results = await Promise.all(folders.map(readMusicFolder))

  const totalFiles = results.reduce((sum, result) => sum + result.files.length, 0)
  const foldersWithErrors = results.filter(r => r.error).length

  return NextResponse.json({
    success: true,
    summary: {
      totalFolders: folders.length,
      totalFiles,
      foldersWithErrors
    },
    folders: results
  })
}

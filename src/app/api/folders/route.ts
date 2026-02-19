import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getMusicFolders, isMusicFile } from '@/lib/config'

export interface MusicFile {
  name: string
  path: string
  extension: string
  size: number
  modifiedAt: string
}

export interface Subfolder {
  name: string
  path: string
}

export interface FolderContent {
  folder: string
  totalFiles: number
  totalSubfolders: number
  subfolders: Subfolder[]
  error?: string
}

async function readMusicFolder(folderPath: string): Promise<FolderContent> {
  try {
    const stats = await fs.stat(folderPath)
    if (!stats.isDirectory()) {
      return {
        folder: folderPath,
        totalFiles: 0,
        totalSubfolders: 0,
        subfolders: [],
        error: 'La ruta no es un directorio'
      }
    }

    const entries = await fs.readdir(folderPath, { withFileTypes: true })
    const subfolders: Subfolder[] = []
    let totalFiles = 0

    for (const entry of entries) {
      if (entry.isDirectory()) {
        subfolders.push({
          name: entry.name,
          path: path.join(folderPath, entry.name)
        })
      } else if (entry.isFile() && isMusicFile(entry.name)) {
        totalFiles++
      }
    }

    return {
      folder: folderPath,
      totalFiles,
      totalSubfolders: subfolders.length,
      subfolders: subfolders.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    return {
      folder: folderPath,
      totalFiles: 0,
      totalSubfolders: 0,
      subfolders: [],
      error: error instanceof Error ? error.message : 'Error desconocido al leer la carpeta'
    }
  }
}

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

  const totalFiles = results.reduce((sum, result) => sum + result.totalFiles, 0)
  const totalSubfolders = results.reduce((sum, result) => sum + result.totalSubfolders, 0)
  const foldersWithErrors = results.filter(r => r.error).length

  return NextResponse.json({
    success: true,
    summary: {
      totalFolders: folders.length,
      totalFiles,
      totalSubfolders,
      foldersWithErrors
    },
    folders: results
  })
}

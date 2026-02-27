import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { FolderContent, Subfolder } from '@/features/folders/domain'
import { DEFAULT_MUSIC_FOLDER, isMusicFile } from '@/features/songs/song-file-helpers'
import { TFunction } from '@/i18n/types'

function buildSummary(results: FolderContent[]) {
  return {
    totalFolders: results.length,
    totalFiles: results.reduce((sum, r) => sum + r.totalFiles, 0),
    totalSubfolders: results.reduce((sum, r) => sum + r.totalSubfolders, 0),
    foldersWithErrors: results.filter(r => r.error).length
  }
}

export function buildGetFoldersJsonResponse(results: FolderContent[]) {
  return NextResponse.json({
    success: true,
    summary: buildSummary(results),
    folders: results
  })
}

export async function getRootFolders(folders: string[], t: TFunction) {
  const isDefaultOnly = folders.length === 1 && folders[0] === DEFAULT_MUSIC_FOLDER

  if (!isDefaultOnly) {
    return Promise.all(folders.map(folder => readMusicFolder(folder, t)))
  }

  const root = await readMusicFolder(DEFAULT_MUSIC_FOLDER, t)

  if (root.error || root.subfolders.length === 0) {
    return root.error ? [root] : []
  }

  return Promise.all(root.subfolders.map(sub => readMusicFolder(sub.path, t)))
}

export async function readMusicFolder(folderPath: string, t: TFunction): Promise<FolderContent> {
  try {
    const stats = await fs.stat(folderPath)
    if (!stats.isDirectory()) {
      return {
        folder: folderPath,
        totalFiles: 0,
        totalSubfolders: 0,
        subfolders: [],
        error: t('pathNotDirectory')
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
      error: error instanceof Error ? error.message : t('unknownError')
    }
  }
}

import fs from 'fs/promises'
import path from 'path'
import { FolderContent, Subfolder } from '@/features/folders/domain'
import { TFunction } from '@/i18n/types'
import { isMusicFile } from '@/lib/config'

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

import fs from 'fs/promises'
import path from 'path'
import { errorMessage } from '../shared/errors'
import { isMusicFile } from './music-file'

export interface ListAudioFilesOptions {
  /** Called for each directory that cannot be read; traversal continues. */
  onError?: (dirPath: string, error: string) => void
}

/**
 * Recursively collect every supported audio file under `folderPath`.
 * Unreadable directories are reported through `onError` and skipped, so a single
 * permission error never aborts a whole library scan.
 */
export async function listAudioFiles(folderPath: string, options: ListAudioFilesOptions = {}): Promise<string[]> {
  const files: string[] = []

  async function scanDir(dirPath: string): Promise<void> {
    let entries
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true })
    } catch (error) {
      options.onError?.(dirPath, errorMessage(error))
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else if (entry.isFile() && isMusicFile(entry.name)) {
        files.push(fullPath)
      }
    }
  }

  await scanDir(folderPath)
  return files
}

import { readAudioMetadata, scanFolder, type ScanOptions, type ScanProgress } from 'audiotagr'
import type { ScanResult } from '@/features/metadata/domain'
import { toSongCreateInput } from '@/features/metadata/song-create-input.adapter'
import { ScanMode } from '@/features/scan/domain'
import {
  createScannedSong,
  deleteSongById,
  findSongByFilePath,
  findSongById,
  getSongIdsAndPathsInTree,
  getSongModifiedTimesInTree,
  replaceScannedSongByFilePath,
  replaceScannedSongById
} from '@/features/songs/songs.repository'

function emptyResult(): ScanResult {
  return {
    addedFiles: [],
    updatedFiles: [],
    deletedFiles: [],
    skippedFiles: [],
    errors: []
  }
}

/**
 * In quick mode, files whose mtime still matches the stored one are left alone.
 * The mtimes are fetched once per folder rather than per file.
 */
async function buildSkipCheck(folderPath: string): Promise<ScanOptions['shouldSkip']> {
  const existingSongs = await getSongModifiedTimesInTree(folderPath)
  const modifiedTimes = new Map(existingSongs.map(song => [song.filePath, song.modifiedAt]))

  return (filePath, stats) => {
    const existingModified = modifiedTimes.get(filePath)
    return existingModified?.getTime() === stats.mtime.getTime()
  }
}

/** Persist one scanned file, reporting whether it was new or replaced. */
async function saveScannedSong(songData: ReturnType<typeof toSongCreateInput>): Promise<'added' | 'updated'> {
  const { metadata, pictures, ...songFields } = songData
  const existing = await findSongByFilePath(songFields.filePath)

  if (existing) {
    await replaceScannedSongByFilePath(songFields.filePath, existing.id, songFields, metadata, pictures)
    return 'updated'
  }

  await createScannedSong(songFields, metadata, pictures)
  return 'added'
}

/** Remove songs whose files are gone from disk. */
async function deleteOrphanedSongs(folderPath: string, scannedPaths: Set<string>, result: ScanResult) {
  const songsInDb = await getSongIdsAndPathsInTree(folderPath)

  for (const song of songsInDb) {
    if (scannedPaths.has(song.filePath)) continue

    try {
      await deleteSongById(song.id)
      result.deletedFiles.push(song.filePath)
    } catch (error) {
      result.errors.push({
        path: song.filePath,
        error: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }
}

export async function scanFolderAndUpdateDatabase(
  folderPath: string,
  onProgress?: (progress: ScanProgress) => void,
  mode: ScanMode = 'full'
): Promise<ScanResult> {
  const result = emptyResult()
  const scannedPaths = new Set<string>()

  const shouldSkip = mode === 'quick' ? await buildSkipCheck(folderPath) : undefined

  for await (const item of scanFolder(folderPath, { shouldSkip })) {
    onProgress?.(item.progress)
    scannedPaths.add(item.filePath)

    if (item.kind === 'skipped') {
      result.skippedFiles.push(item.filePath)
      continue
    }

    if (item.kind === 'error') {
      result.errors.push({ path: item.filePath, error: item.error })
      continue
    }

    try {
      const outcome = await saveScannedSong(toSongCreateInput(item.metadata))
      if (outcome === 'added') {
        result.addedFiles.push(item.filePath)
      } else {
        result.updatedFiles.push(item.filePath)
      }
    } catch (error) {
      result.errors.push({
        path: item.filePath,
        error: error instanceof Error ? error.message : 'Unknown database error'
      })
    }
  }

  await deleteOrphanedSongs(folderPath, scannedPaths, result)

  return result
}

export async function scanAllFoldersAndUpdateDatabase(
  folders: string[],
  onProgress?: (progress: ScanProgress & { folder: string }) => void,
  mode: ScanMode = 'full'
): Promise<ScanResult> {
  const result = emptyResult()

  for (const folder of folders) {
    const folderResult = await scanFolderAndUpdateDatabase(
      folder,
      progress => onProgress?.({ ...progress, folder }),
      mode
    )

    result.addedFiles.push(...folderResult.addedFiles)
    result.updatedFiles.push(...folderResult.updatedFiles)
    result.deletedFiles.push(...folderResult.deletedFiles)
    result.skippedFiles.push(...folderResult.skippedFiles)
    result.errors.push(...folderResult.errors)
  }

  return result
}

/**
 * Re-read a single song's file and replace its database row.
 * @returns the updated song with its metadata and pictures
 */
export async function rescanSongFileAndSaveIntoDb(songId: number) {
  const existingSong = await findSongById(songId)

  if (!existingSong) {
    throw new Error('Song not found')
  }

  const { metadata, pictures, ...songFields } = toSongCreateInput(await readAudioMetadata(existingSong.filePath))

  return replaceScannedSongById(songId, songFields, metadata, pictures)
}

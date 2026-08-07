import fs from 'fs/promises'
import { listAudioFiles } from '../files/list-audio-files'
import { readAudioMetadata } from '../read/read-audio-metadata'
import { errorMessage } from '../shared/errors'
import { DEFAULT_SCAN_BATCH_SIZE, endBatch } from './batch'
import { ScanItem, ScanOptions } from './domain'

/**
 * Walk `folderPath` and yield one item per audio file found: its metadata, a
 * skip notice, or the error that prevented reading it. Consumers persist each
 * item as it arrives, so a scan never materializes a whole library in memory.
 *
 * Files are processed in batches; between batches the generator yields the event
 * loop and forces a GC pass to release cover-art buffers.
 */
export async function* scanFolder(folderPath: string, options: ScanOptions = {}): AsyncGenerator<ScanItem> {
  const { batchSize = DEFAULT_SCAN_BATCH_SIZE, shouldSkip, onDirectoryError, signal } = options

  const files = await listAudioFiles(folderPath, { onError: onDirectoryError })
  const total = files.length

  for (let i = 0; i < total; i++) {
    signal?.throwIfAborted()

    const filePath = files[i]
    const progress = { current: i + 1, total, currentFile: filePath }

    if (shouldSkip && (await canSkip(filePath, shouldSkip))) {
      yield { kind: 'skipped', filePath, progress }
    } else {
      try {
        yield { kind: 'song', filePath, progress, metadata: await readAudioMetadata(filePath) }
      } catch (error) {
        yield { kind: 'error', filePath, progress, error: errorMessage(error) }
      }
    }

    const isLastOfBatch = (i + 1) % batchSize === 0
    if (isLastOfBatch || i === total - 1) {
      await endBatch()
    }
  }
}

/** Scan several folders in sequence, tagging each item with its root folder. */
export async function* scanFolders(
  folderPaths: string[],
  options: ScanOptions = {}
): AsyncGenerator<ScanItem & { folder: string }> {
  for (const folder of folderPaths) {
    for await (const item of scanFolder(folder, options)) {
      yield { ...item, folder }
    }
  }
}

/** A file that cannot be stat'ed is never skipped: it gets a full read instead. */
async function canSkip(filePath: string, shouldSkip: NonNullable<ScanOptions['shouldSkip']>): Promise<boolean> {
  try {
    return await shouldSkip(filePath, await fs.stat(filePath))
  } catch {
    return false
  }
}

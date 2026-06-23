import fs from 'fs/promises'
import * as musicMetadata from 'music-metadata'
import path from 'path'
import {
  MAPPED_NATIVE_TAGS,
  MetadataInput,
  PictureInput,
  ScanProgress,
  ScanResult,
  SongCreateInput
} from '@/features/metadata/domain'
import { ScanMode } from '@/features/scan/domain'
import { joinMultiValue } from '@/features/songs/metadata-helpers'
import { isMusicFile } from '@/features/songs/song-file-helpers'
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
import { parseDate } from '@/lib/date'

// Process files in batches so we can periodically yield the event loop and
// reclaim off-heap memory between batches (issue #22).
const SCAN_FILE_BATCH_SIZE = 100

async function getAllMusicFiles(folderPath: string): Promise<string[]> {
  const files: string[] = []

  async function scanDir(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          await scanDir(fullPath)
        } else if (entry.isFile() && isMusicFile(entry.name)) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error)
    }
  }

  await scanDir(folderPath)
  return files
}

function getNativeTagValue(
  native: Record<string, Array<{ id: string; value: unknown }>> | undefined,
  tagName: string
): string | undefined {
  if (!native) return undefined
  for (const tags of Object.values(native)) {
    const tag = tags.find(t => t.id.toUpperCase() === tagName.toUpperCase())
    if (tag && typeof tag.value === 'string') return tag.value
  }
  return undefined
}

// ID3v2.2 uses shorter frame IDs (TXX instead of TXXX). For these frames,
// the description is embedded in the value as "DESCRIPTION\0VALUE".
// Check if the description matches a mapped TXXX subtag.
const TXXX_SHORT_IDS = new Set(['TXX', 'TXXX'])
function isMappedNativeTag(tagId: string, value: string): boolean {
  const upperId = tagId.toUpperCase()
  if (MAPPED_NATIVE_TAGS.has(upperId)) return true

  // For TXX/TXXX frames, check if TXXX:DESCRIPTION is mapped
  if (TXXX_SHORT_IDS.has(upperId)) {
    const nullIndex = value.indexOf('\0')
    const description = nullIndex >= 0 ? value.substring(0, nullIndex) : value
    return MAPPED_NATIVE_TAGS.has(`TXXX:${description.toUpperCase()}`)
  }

  return false
}

async function extractMetadata(filePath: string): Promise<SongCreateInput | null> {
  try {
    const stats = await fs.stat(filePath)
    const metadata = await musicMetadata.parseFile(filePath, { duration: true })
    const { common, format } = metadata

    const additionalMetadata: MetadataInput[] = []

    if (metadata.native) {
      for (const [formatType, tags] of Object.entries(metadata.native)) {
        for (const tag of tags) {
          if (typeof tag.value === 'string' && !isMappedNativeTag(tag.id, tag.value)) {
            let metaKey = `${formatType}:${tag.id}`
            let metaValue = tag.value

            // TXX (ID3v2.2) embeds description in value as "DESC\0VALUE"
            // Normalize to match TXXX format: key becomes "format:TXX:DESC", value becomes just the value
            if (TXXX_SHORT_IDS.has(tag.id.toUpperCase()) && tag.value.includes('\0')) {
              const nullIndex = tag.value.indexOf('\0')
              const description = tag.value.substring(0, nullIndex)
              metaKey = `${formatType}:${tag.id}:${description}`
              let text = tag.value.substring(nullIndex + 1)
              if (text.charCodeAt(0) === 0xfeff) text = text.substring(1)
              metaValue = text
            }

            additionalMetadata.push({
              key: metaKey,
              value: metaValue
            })
          }
        }
      }
    }

    // Wrap the existing bytes in a Buffer view instead of copying them: a copy
    // transiently doubles the off-heap footprint of every embedded image and is
    // a key contributor to the scan memory pressure in issue #22.
    const pictures: PictureInput[] = (common.picture || []).map(pic => ({
      type: pic.type || null,
      format: pic.format,
      description: pic.description || null,
      data: Buffer.from(pic.data.buffer, pic.data.byteOffset, pic.data.byteLength)
    }))

    return {
      filePath,
      fileName: path.basename(filePath),
      folderPath: path.dirname(filePath),
      extension: path.extname(filePath).toLowerCase().slice(1),
      fileSize: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,

      // Metadata principal
      title: common.title || null,
      artist: joinMultiValue(common.artists ?? []) || common.artist || null,
      sortArtist: common.artistsort || null,
      album: common.album || null,
      sortAlbum: common.albumsort || null,
      trackNumber: common.track?.no || null,
      trackTotal: common.track?.of || null,
      discNumber: common.disk?.no || null,
      discTotal: common.disk?.of || null,
      year: common.year || null,
      bpm: common.bpm || null,
      genre: joinMultiValue(common.genre ?? []) || null,
      albumArtist: joinMultiValue(common.albumartists ?? []) || common.albumartist || null,
      sortAlbumArtist: common.albumartistsort || null,
      composer: joinMultiValue(common.composer ?? []) || null,
      conductor: joinMultiValue(common.conductor ?? []) || null,
      comment: common.comment?.[0]?.text || null,
      grouping: common.grouping || null,
      publisher: joinMultiValue(common.label ?? []) || getNativeTagValue(metadata.native, 'PUBLISHER') || null,
      catalogNumber: joinMultiValue(common.catalognumber ?? []) || null,
      lyricist: joinMultiValue(common.lyricist ?? []) || null,
      barcode: common.barcode || null,
      work:
        common.work ||
        getNativeTagValue(metadata.native, 'WORK') ||
        getNativeTagValue(metadata.native, 'TXXX:WORK') ||
        null,
      originalReleaseDate: parseDate(common.originaldate || common.originalyear?.toString()) ?? null,
      copyright: common.copyright || null,
      rating: common.rating?.[0]?.rating ? Math.round(common.rating[0].rating * 100) : null,
      lyrics: common.lyrics?.[0]?.text || null,
      compilation: common.compilation || false,

      // Playback
      volume: null,
      startTime: null,
      stopTime: null,
      gapless: common.gapless || false,

      // Stats
      dateAdded: new Date(),

      // Audio info
      duration: format.duration || null,
      bitrate: format.bitrate ? Math.round(format.bitrate) : null,
      sampleRate: format.sampleRate || null,
      channels: format.numberOfChannels || null,
      bitsPerSample: format.bitsPerSample || null,
      codec: format.codec || null,
      lossless: format.lossless || false,
      encoder: common.encodedby || null,

      // Relaciones
      metadata: additionalMetadata.length > 0 ? additionalMetadata : undefined,
      pictures: pictures.length > 0 ? pictures : undefined
    }
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error)
    return null
  }
}

export async function scanFolderAndUpdateDatabase(
  folderPath: string,
  onProgress?: (progress: ScanProgress) => void,
  mode: ScanMode = 'full'
): Promise<ScanResult> {
  const result: ScanResult = {
    addedFiles: [],
    updatedFiles: [],
    deletedFiles: [],
    skippedFiles: [],
    errors: []
  }

  const files = await getAllMusicFiles(folderPath)
  const total = files.length

  // In quick mode, pre-fetch existing songs to skip unchanged files
  let existingMap: Map<string, Date> | null = null
  if (mode === 'quick') {
    const existingSongs = await getSongModifiedTimesInTree(folderPath)
    existingMap = new Map(existingSongs.map(s => [s.filePath, s.modifiedAt!]))
  }

  // Process files in batches. Between batches we yield the event loop and force
  // a GC pass so the off-heap cover-art buffers from the previous batch are
  // reclaimed before the next batch loads more. Without this the V8 external
  // memory pool grows unchecked on large libraries and the process aborts with
  // SIGSEGV (issue #22).
  for (let start = 0; start < files.length; start += SCAN_FILE_BATCH_SIZE) {
    const batchEnd = Math.min(start + SCAN_FILE_BATCH_SIZE, files.length)

    for (let i = start; i < batchEnd; i++) {
      const filePath = files[i]

      onProgress?.({
        current: i + 1,
        total,
        currentFile: filePath
      })

      // In quick mode, skip files that haven't changed
      if (existingMap) {
        try {
          const stats = await fs.stat(filePath)
          const existingModified = existingMap.get(filePath)
          if (existingModified && existingModified.getTime() === stats.mtime.getTime()) {
            result.skippedFiles.push(filePath)
            continue
          }
        } catch {
          // If we can't stat the file, proceed with scanning it
        }
      }

      const songData = await extractMetadata(filePath)

      if (!songData) {
        result.errors.push({ path: filePath, error: 'Failed to extract metadata' })
        continue
      }

      try {
        // Verificar si ya existe
        const existing = await findSongByFilePath(filePath)

        const { metadata, pictures, ...songFields } = songData

        if (existing) {
          await replaceScannedSongByFilePath(filePath, existing.id, songFields, metadata, pictures)
          result.updatedFiles.push(filePath)
        } else {
          await createScannedSong(songFields, metadata, pictures)
          result.addedFiles.push(filePath)
        }
      } catch (error) {
        result.errors.push({
          path: filePath,
          error: error instanceof Error ? error.message : 'Unknown database error'
        })
      }
    }

    // Yield to the event loop, then reclaim off-heap buffers. globalThis.gc is
    // only defined when Node runs with --expose-gc (set in the Docker image);
    // the optional call is a harmless no-op otherwise.
    await new Promise<void>(resolve => setImmediate(resolve))
    ;(globalThis as { gc?: () => void }).gc?.()
  }

  // Eliminar canciones que ya no existen en el sistema de archivos
  const existingPaths = new Set(files)
  const songsInDb = await getSongIdsAndPathsInTree(folderPath)

  for (const song of songsInDb) {
    if (!existingPaths.has(song.filePath)) {
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

  return result
}

export async function scanAllFoldersAndUpdateDatabase(
  folders: string[],
  onProgress?: (progress: ScanProgress & { folder: string }) => void,
  mode: ScanMode = 'full'
): Promise<ScanResult> {
  const result: ScanResult = {
    addedFiles: [],
    updatedFiles: [],
    deletedFiles: [],
    skippedFiles: [],
    errors: []
  }

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
 * Re-scan a single song file and update its metadata in the database
 * @param songId The ID of the song to rescan
 * @returns The updated song with metadata and pictures
 */
export async function rescanSongFileAndSaveIntoDb(songId: number) {
  // Get the song from database
  const existingSong = await findSongById(songId)

  if (!existingSong) {
    throw new Error('Song not found')
  }

  // Extract fresh metadata from the file
  const songData = await extractMetadata(existingSong.filePath)

  if (!songData) {
    throw new Error('Failed to extract metadata from file')
  }

  const { metadata, pictures, ...songFields } = songData

  // Replace song with fresh data
  return replaceScannedSongById(songId, songFields, metadata, pictures)
}

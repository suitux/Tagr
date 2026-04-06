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
import {
  BOOLEAN_SONG_FIELDS,
  DATE_SONG_FIELDS,
  DURATION_SONG_FIELDS,
  MULTI_VALUE_SEPARATOR,
  NUMERIC_SONG_FIELDS,
  SELECT_SONG_FIELDS,
  Song,
  SongColumnFilters,
  SongSortDirection,
  SongSortField
} from '@/features/songs/domain'
import { isMusicFile } from '@/features/songs/song-file-helpers'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { parseDate } from '@/lib/date'

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

    // Extraer imágenes
    const pictures: PictureInput[] = (common.picture || []).map(pic => ({
      type: pic.type || null,
      format: pic.format,
      description: pic.description || null,
      data: Buffer.from(pic.data)
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
      artist: common.artist || null,
      sortArtist: common.artistsort || null,
      album: common.album || null,
      sortAlbum: common.albumsort || null,
      trackNumber: common.track?.no || null,
      trackTotal: common.track?.of || null,
      discNumber: common.disk?.no || null,
      discTotal: common.disk?.of || null,
      year: common.year || null,
      bpm: common.bpm || null,
      genre: common.genre?.[0] || null,
      albumArtist: common.albumartist || null,
      sortAlbumArtist: common.albumartistsort || null,
      composer: common.composer?.[0] || null,
      conductor: common.conductor?.[0] || null,
      comment: common.comment?.[0]?.text || null,
      grouping: common.grouping || null,
      publisher: common.label?.[0] || getNativeTagValue(metadata.native, 'PUBLISHER') || null,
      catalogNumber: common.catalognumber?.[0] || null,
      lyricist: common.lyricist?.[0] || null,
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

  const folderPathFilter = {
    OR: [{ folderPath }, { folderPath: { startsWith: folderPath + '/' } }]
  }

  // In quick mode, pre-fetch existing songs to skip unchanged files
  let existingMap: Map<string, Date> | null = null
  if (mode === 'quick') {
    const existingSongs = await prisma.song.findMany({
      where: folderPathFilter,
      select: { filePath: true, modifiedAt: true }
    })
    existingMap = new Map(existingSongs.map(s => [s.filePath, s.modifiedAt!]))
  }

  for (let i = 0; i < files.length; i++) {
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
      const existing = await prisma.song.findUnique({
        where: { filePath }
      })

      const { metadata, pictures, ...songFields } = songData

      if (existing) {
        // Actualizar: primero eliminar metadata y pictures existentes
        await prisma.songMetadata.deleteMany({ where: { songId: existing.id } })
        await prisma.songPicture.deleteMany({ where: { songId: existing.id } })

        // Actualizar song
        await prisma.song.update({
          where: { filePath },
          data: {
            ...songFields,
            scannedAt: new Date(),
            ...(metadata && {
              metadata: {
                create: metadata
              }
            }),
            ...(pictures && {
              pictures: {
                create: pictures
              }
            })
          }
        })
        result.updatedFiles.push(filePath)
      } else {
        // Crear nuevo
        await prisma.song.create({
          data: {
            ...songFields,
            ...(metadata && {
              metadata: {
                create: metadata
              }
            }),
            ...(pictures && {
              pictures: {
                create: pictures
              }
            })
          }
        })
        result.addedFiles.push(filePath)
      }
    } catch (error) {
      result.errors.push({
        path: filePath,
        error: error instanceof Error ? error.message : 'Unknown database error'
      })
    }
  }

  // Eliminar canciones que ya no existen en el sistema de archivos
  const existingPaths = new Set(files)
  const songsInDb = await prisma.song.findMany({
    where: folderPathFilter,
    select: { id: true, filePath: true }
  })

  for (const song of songsInDb) {
    if (!existingPaths.has(song.filePath)) {
      try {
        await prisma.song.delete({
          where: { id: song.id }
        })
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

export const PAGE_SIZE = 50

export async function getDistinctValues(field: SongSortField): Promise<string[]> {
  const rows = (await prisma.song.findMany({
    distinct: [field],
    select: { [field]: true }
  })) as Record<string, unknown>[]

  return rows
    .map(row => row[field])
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .sort((a, b) => a.localeCompare(b))
}

function buildColumnFiltersWhere(filters?: SongColumnFilters): Record<string, unknown>[] {
  if (!filters) return []
  const conditions: Record<string, unknown>[] = []

  for (const [field, value] of Object.entries(filters)) {
    if (!value) continue
    const songField = field as SongSortField

    if (DATE_SONG_FIELDS.has(songField)) {
      const [fromStr, toStr] = value.split('..')
      const condition: Record<string, Date> = {}
      if (fromStr) condition.gte = new Date(fromStr + 'T00:00:00')
      if (toStr) condition.lte = new Date(toStr + 'T23:59:59')
      if (Object.keys(condition).length > 0) {
        conditions.push({ [field]: condition })
      }
    } else if (BOOLEAN_SONG_FIELDS.has(songField)) {
      conditions.push({ [field]: { equals: value === 'true' || value === '1' } })
    } else if (DURATION_SONG_FIELDS.has(songField)) {
      const ranges = value.split(MULTI_VALUE_SEPARATOR).filter(Boolean)
      const rangeConditions: Record<string, unknown>[] = []
      for (const range of ranges) {
        const [minStr, maxStr] = range.split('..')
        const condition: Record<string, number> = {}
        if (minStr) condition.gte = Number(minStr)
        if (maxStr) condition.lt = Number(maxStr)
        if (Object.keys(condition).length > 0) {
          rangeConditions.push({ [field]: condition })
        }
      }
      if (rangeConditions.length === 1) {
        conditions.push(rangeConditions[0])
      } else if (rangeConditions.length > 1) {
        conditions.push({ OR: rangeConditions })
      }
    } else if (NUMERIC_SONG_FIELDS.has(songField)) {
      const nums = value
        .split(MULTI_VALUE_SEPARATOR)
        .map(Number)
        .filter(n => !Number.isNaN(n))
      if (nums.length === 1) {
        conditions.push({ [field]: { equals: nums[0] } })
      } else if (nums.length > 1) {
        conditions.push({ [field]: { in: nums } })
      }
    } else if (SELECT_SONG_FIELDS.has(songField)) {
      const values = value.split(MULTI_VALUE_SEPARATOR).filter(Boolean)
      if (values.length === 1) {
        conditions.push({ [field]: { equals: values[0] } })
      } else if (values.length > 1) {
        conditions.push({ [field]: { in: values } })
      }
    } else {
      const values = value.split(MULTI_VALUE_SEPARATOR).filter(Boolean)
      if (values.length === 1) {
        conditions.push({ [field]: { contains: values[0] } })
      } else if (values.length > 1) {
        conditions.push({ OR: values.map(v => ({ [field]: { contains: v } })) })
      }
    }
  }

  return conditions
}

export async function getSongsByFolder(
  folderPath: string,
  search?: string,
  sortField?: SongSortField,
  sort?: SongSortDirection,
  skip?: number,
  take?: number,
  filters?: SongColumnFilters
): Promise<Song[]> {
  const defaultOrder = [{ trackNumber: 'asc' as const }, { fileName: 'asc' as const }]

  const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder
  const columnFilterConditions = buildColumnFiltersWhere(filters)

  return prisma.song.findMany({
    where: {
      folderPath,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { artist: { contains: search } },
          { publisher: { contains: search } },
          { album: { contains: search } },
          { fileName: { contains: search } },
          { comment: { contains: search } }
        ]
      }),
      ...(columnFilterConditions.length > 0 && {
        AND: columnFilterConditions
      })
    },
    orderBy,
    skip,
    take
  })
}

export async function countSongsByFolder(
  folderPath: string,
  search?: string,
  filters?: SongColumnFilters
): Promise<number> {
  const columnFilterConditions = buildColumnFiltersWhere(filters)

  return prisma.song.count({
    where: {
      folderPath,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { artist: { contains: search } },
          { publisher: { contains: search } },
          { album: { contains: search } },
          { fileName: { contains: search } },
          { comment: { contains: search } }
        ]
      }),
      ...(columnFilterConditions.length > 0 && {
        AND: columnFilterConditions
      })
    }
  })
}

export async function getAdjacentSongs(
  songId: number,
  folderPath: string,
  search?: string,
  sortField?: SongSortField,
  sort?: SongSortDirection,
  filters?: SongColumnFilters
): Promise<{ previous: Song | null; next: Song | null }> {
  const defaultOrder = [{ trackNumber: 'asc' as const }, { fileName: 'asc' as const }]
  const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder
  const columnFilterConditions = buildColumnFiltersWhere(filters)

  const where = {
    folderPath,
    ...(search && {
      OR: [
        { title: { contains: search } },
        { artist: { contains: search } },
        { publisher: { contains: search } },
        { album: { contains: search } },
        { fileName: { contains: search } },
        { comment: { contains: search } }
      ]
    }),
    ...(columnFilterConditions.length > 0 && {
      AND: columnFilterConditions
    })
  }

  // Get all IDs in order to find position of current song
  const orderedIds = await prisma.song.findMany({
    where,
    orderBy,
    select: { id: true }
  })

  const currentIndex = orderedIds.findIndex(s => s.id === songId)
  if (currentIndex === -1) {
    return { previous: null, next: null }
  }

  const prevId = currentIndex > 0 ? orderedIds[currentIndex - 1].id : null
  const nextId = currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1].id : null

  const [previous, next] = await Promise.all([
    prevId !== null ? prisma.song.findUnique({ where: { id: prevId } }) : null,
    nextId !== null ? prisma.song.findUnique({ where: { id: nextId } }) : null
  ])

  return { previous, next }
}

/**
 * Re-scan a single song file and update its metadata in the database
 * @param songId The ID of the song to rescan
 * @returns The updated song with metadata and pictures
 */
export async function rescanSongFileAndSaveIntoDb(songId: number) {
  // Get the song from database
  const existingSong = await prisma.song.findUnique({
    where: { id: songId }
  })

  if (!existingSong) {
    throw new Error('Song not found')
  }

  // Extract fresh metadata from the file
  const songData = await extractMetadata(existingSong.filePath)

  if (!songData) {
    throw new Error('Failed to extract metadata from file')
  }

  const { metadata, pictures, ...songFields } = songData

  // Delete existing metadata and pictures
  await prisma.songMetadata.deleteMany({ where: { songId } })
  await prisma.songPicture.deleteMany({ where: { songId } })

  // Update song with fresh data
  return prisma.song.update({
    where: { id: songId },
    data: {
      ...songFields,
      scannedAt: new Date(),
      ...(metadata && {
        metadata: {
          create: metadata
        }
      }),
      ...(pictures && {
        pictures: {
          create: pictures
        }
      })
    },
    include: {
      metadata: true,
      pictures: true
    }
  })
}

import fs from 'fs/promises'
import * as musicMetadata from 'music-metadata'
import path from 'path'
import { Song, SongSortField, SongSortDirection } from '@/features/songs/domain'
import { isMusicFile } from '@/lib/config'
import { prisma } from './client'

export interface ScanResult {
  totalScanned: number
  totalAdded: number
  totalUpdated: number
  totalDeleted: number
  totalErrors: number
  errors: Array<{ path: string; error: string }>
}

export interface ScanProgress {
  current: number
  total: number
  currentFile: string
}

interface MetadataInput {
  key: string
  value: string | null
}

interface PictureInput {
  type: string | null
  format: string | null
  description: string | null
  data: Buffer | null
}

interface SongCreateInput {
  filePath: string
  fileName: string
  folderPath: string
  extension: string
  fileSize: number
  createdAt: Date | null
  modifiedAt: Date | null
  title: string | null
  artist: string | null
  album: string | null
  albumArtist: string | null
  year: number | null
  trackNumber: number | null
  trackTotal: number | null
  discNumber: number | null
  discTotal: number | null
  genre: string | null
  duration: number | null
  composer: string | null
  comment: string | null
  lyrics: string | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  bitsPerSample: number | null
  codec: string | null
  lossless: boolean
  bpm: number | null
  metadata?: MetadataInput[]
  pictures?: PictureInput[]
}

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

async function extractMetadata(filePath: string): Promise<SongCreateInput | null> {
  try {
    const stats = await fs.stat(filePath)
    const metadata = await musicMetadata.parseFile(filePath)
    const { common, format } = metadata

    // Metadata adicional (todo lo que no está en los campos comunes)
    const additionalMetadata: MetadataInput[] = []

    // Extraer tags nativos
    if (metadata.native) {
      for (const [formatType, tags] of Object.entries(metadata.native)) {
        for (const tag of tags) {
          // Solo guardar valores string
          if (typeof tag.value === 'string') {
            additionalMetadata.push({
              key: `${formatType}:${tag.id}`,
              value: tag.value
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

      // Metadata común
      title: common.title || null,
      artist: common.artist || null,
      album: common.album || null,
      albumArtist: common.albumartist || null,
      year: common.year || null,
      trackNumber: common.track?.no || null,
      trackTotal: common.track?.of || null,
      discNumber: common.disk?.no || null,
      discTotal: common.disk?.of || null,
      genre: common.genre?.[0] || null,
      duration: format.duration || null,
      composer: common.composer?.[0] || null,
      comment: common.comment?.[0]?.text || null,
      lyrics: common.lyrics?.[0]?.text || null,
      bpm: common.bpm || null,

      // Información de audio
      bitrate: format.bitrate ? Math.round(format.bitrate) : null,
      sampleRate: format.sampleRate || null,
      channels: format.numberOfChannels || null,
      bitsPerSample: format.bitsPerSample || null,
      codec: format.codec || null,
      lossless: format.lossless || false,

      // Relaciones
      metadata: additionalMetadata.length > 0 ? additionalMetadata : undefined,
      pictures: pictures.length > 0 ? pictures : undefined
    }
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error)
    return null
  }
}

export async function scanFolder(
  folderPath: string,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanResult> {
  const result: ScanResult = {
    totalScanned: 0,
    totalAdded: 0,
    totalUpdated: 0,
    totalDeleted: 0,
    totalErrors: 0,
    errors: []
  }

  const files = await getAllMusicFiles(folderPath)
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    result.totalScanned++

    onProgress?.({
      current: i + 1,
      total,
      currentFile: filePath
    })

    const songData = await extractMetadata(filePath)

    if (!songData) {
      result.totalErrors++
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
        result.totalUpdated++
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
        result.totalAdded++
      }
    } catch (error) {
      result.totalErrors++
      result.errors.push({
        path: filePath,
        error: error instanceof Error ? error.message : 'Unknown database error'
      })
    }
  }

  // Eliminar canciones que ya no existen en el sistema de archivos
  const existingPaths = new Set(files)
  const songsInDb = await prisma.song.findMany({
    where: {
      folderPath: {
        startsWith: folderPath
      }
    },
    select: { id: true, filePath: true }
  })

  for (const song of songsInDb) {
    if (!existingPaths.has(song.filePath)) {
      try {
        await prisma.song.delete({
          where: { id: song.id }
        })
        result.totalDeleted++
      } catch (error) {
        result.totalErrors++
        result.errors.push({
          path: song.filePath,
          error: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
  }

  return result
}

export async function scanAllFolders(
  folders: string[],
  onProgress?: (progress: ScanProgress & { folder: string }) => void
): Promise<ScanResult> {
  const result: ScanResult = {
    totalScanned: 0,
    totalAdded: 0,
    totalUpdated: 0,
    totalDeleted: 0,
    totalErrors: 0,
    errors: []
  }

  for (const folder of folders) {
    const folderResult = await scanFolder(folder, progress => onProgress?.({ ...progress, folder }))

    result.totalScanned += folderResult.totalScanned
    result.totalAdded += folderResult.totalAdded
    result.totalUpdated += folderResult.totalUpdated
    result.totalDeleted += folderResult.totalDeleted
    result.totalErrors += folderResult.totalErrors
    result.errors.push(...folderResult.errors)
  }

  return result
}

export async function getSongsByFolder(
  folderPath: string,
  search?: string,
  sortField?: SongSortField,
  sort?: SongSortDirection
): Promise<Song[]> {
  const defaultOrder = [{ trackNumber: 'asc' as const }, { fileName: 'asc' as const }]

  const orderBy = sortField && sort ? [{ [sortField]: sort }] : defaultOrder

  return prisma.song.findMany({
    where: {
      folderPath,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { artist: { contains: search } },
          { album: { contains: search } },
          { fileName: { contains: search } }
        ]
      })
    },
    orderBy
  })
}

/**
 * Re-scan a single song file and update its metadata in the database
 * @param songId The ID of the song to rescan
 * @returns The updated song with metadata and pictures
 */
export async function rescanSongFile(songId: number) {
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

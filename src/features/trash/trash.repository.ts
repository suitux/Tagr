import type { Song } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface SongLocation {
  filePath: string
  folderPath: string
  fileName: string
}

export function markSongTrashed(id: number, location: SongLocation, originalFilePath: string): Promise<Song> {
  return prisma.song.update({
    where: { id },
    data: { ...location, originalFilePath, deletedAt: new Date() }
  })
}

export function markSongRestored(id: number, location: SongLocation): Promise<Song> {
  return prisma.song.update({
    where: { id },
    data: { ...location, originalFilePath: null, deletedAt: null }
  })
}

export async function findTrashedSongIdsDeletedBefore(before: Date): Promise<number[]> {
  const rows = await prisma.song.findMany({ where: { deletedAt: { lt: before } }, select: { id: true } })
  return rows.map(row => row.id)
}

import type { Song } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface SongLocation {
  filePath: string
  folderPath: string
  fileName: string
}

const TRASHED = { deletedAt: { not: null } }

/** Flags the row and logs the deletion for the usage report, together. */
export async function markSongTrashed(id: number, location: SongLocation, originalFilePath: string): Promise<Song> {
  const deletedAt = new Date()

  const [song] = await prisma.$transaction([
    prisma.song.update({ where: { id }, data: { ...location, originalFilePath, deletedAt } }),
    prisma.songDeletion.create({ data: { deletedAt } })
  ])

  return song
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

export function countTrashedSongsDeletedBefore(before: Date): Promise<number> {
  return prisma.song.count({ where: { deletedAt: { lt: before } } })
}

export function findTrashedSongFiles(): Promise<{ id: number; filePath: string }[]> {
  return prisma.song.findMany({ where: TRASHED, select: { id: true, filePath: true } })
}

export async function getTrashTotals(): Promise<{ count: number; totalSize: number }> {
  const totals = await prisma.song.aggregate({ where: TRASHED, _count: { _all: true }, _sum: { fileSize: true } })
  return { count: totals._count._all, totalSize: totals._sum.fileSize ?? 0 }
}

export async function deleteSongDeletionsBefore(before: Date): Promise<number> {
  const { count } = await prisma.songDeletion.deleteMany({ where: { deletedAt: { lt: before } } })
  return count
}

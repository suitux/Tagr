import { Prisma, type SongChangeHistory } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

export type HistoryEntryWithSong = Prisma.SongChangeHistoryGetPayload<{
  include: { song: { select: { title: true; artist: true } } }
}>

export interface ListHistoryOptions {
  limit: number
  cursorId: number | null
  search?: string
  songId?: number
}

export interface HistoryEntryInput {
  songId: number
  field: string
  oldValue: string | null
  newValue: string | null
  changedBy?: string
}

export interface LatestPicture {
  data: Uint8Array | null
  format: string | null
}

export async function createHistoryEntries(entries: HistoryEntryInput[]): Promise<void> {
  if (entries.length === 0) return
  await prisma.songChangeHistory.createMany({ data: entries })
}

export async function createHistoryEntry(entry: HistoryEntryInput): Promise<void> {
  await prisma.songChangeHistory.create({ data: entry })
}

export function findLatestPicture(songId: number): Promise<LatestPicture | null> {
  return prisma.songPicture.findFirst({
    where: { songId },
    select: { data: true, format: true }
  })
}

export function findHistoryEntryById(id: number): Promise<SongChangeHistory | null> {
  return prisma.songChangeHistory.findUnique({ where: { id } })
}

/** Lists history entries newest-first; fetches one extra row for cursor pagination. */
export function listHistory({ limit, cursorId, search, songId }: ListHistoryOptions): Promise<HistoryEntryWithSong[]> {
  const where: Prisma.SongChangeHistoryWhereInput = {}
  if (songId) where.songId = songId
  if (search) {
    where.song = { OR: [{ title: { contains: search } }, { artist: { contains: search } }] }
  }

  return prisma.songChangeHistory.findMany({
    take: limit + 1,
    ...(cursorId && {
      cursor: { id: cursorId },
      skip: 1
    }),
    orderBy: { id: 'desc' },
    where,
    include: {
      song: {
        select: { title: true, artist: true }
      }
    }
  })
}

import type { Prisma, SharedLink } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

export type SharedLinkWithSong = Prisma.SharedLinkGetPayload<{
  include: { song: { include: { metadata: true } } }
}>

export type SharedLinkWithSongFile = Prisma.SharedLinkGetPayload<{
  include: { song: { select: { filePath: true; fileName: true } } }
}>

export type SharedLinkWithSongId = Prisma.SharedLinkGetPayload<{
  include: { song: { select: { id: true } } }
}>

export type SharedLinkWithSongTags = Prisma.SharedLinkGetPayload<{
  include: { song: { select: { title: true; artist: true; album: true } } }
}>

/** A link to a song in the trash behaves like a link that does not exist. */
const LIVE_SONG = { deletedAt: null }

export function createSharedLink(token: string, songId: number, expiresAt: Date): Promise<SharedLink> {
  return prisma.sharedLink.create({ data: { token, songId, expiresAt } })
}

export function deleteExpiredSharedLinks(): Promise<unknown> {
  return prisma.sharedLink.deleteMany({ where: { expiresAt: { lt: new Date() } } })
}

export function findSharedLinkWithSong(token: string): Promise<SharedLinkWithSong | null> {
  return prisma.sharedLink.findFirst({
    where: { token, song: LIVE_SONG },
    include: { song: { include: { metadata: true } } }
  })
}

export function findSharedLinkWithSongFile(token: string): Promise<SharedLinkWithSongFile | null> {
  return prisma.sharedLink.findFirst({
    where: { token, song: LIVE_SONG },
    include: { song: { select: { filePath: true, fileName: true } } }
  })
}

export function findSharedLinkWithSongId(token: string): Promise<SharedLinkWithSongId | null> {
  return prisma.sharedLink.findFirst({
    where: { token, song: LIVE_SONG },
    include: { song: { select: { id: true } } }
  })
}

export function findSharedLinkWithSongTags(token: string): Promise<SharedLinkWithSongTags | null> {
  return prisma.sharedLink.findFirst({
    where: { token, song: LIVE_SONG },
    include: { song: { select: { title: true, artist: true, album: true } } }
  })
}

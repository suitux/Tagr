import type { ListenPayload, ListenWithSong, ScrobbleProviderId } from '@/features/scrobbling/domain'
import type { Listen, ScrobbleAccount, ScrobbleQueueItem } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

// --- Listens -------------------------------------------------------------

export interface CreateListenInput {
  userId: string
  songId: number
  listenedAt: Date
  trackName: string
  artistName: string | null
  releaseName: string | null
}

export function createListen(input: CreateListenInput): Promise<Listen> {
  return prisma.listen.create({ data: input })
}

/**
 * Bumps the denormalized play stats shown in the songs table and detail panel.
 * `playCount` is read first because incrementing a NULL (a song scanned without the tag)
 * would keep it NULL forever.
 */
export async function incrementSongPlayStats(songId: number, listenedAt: Date): Promise<void> {
  const current = await prisma.song.findUnique({ where: { id: songId }, select: { playCount: true } })

  await prisma.song.update({
    where: { id: songId },
    data: { playCount: (current?.playCount ?? 0) + 1, lastPlayed: listenedAt }
  })
}

/** Recent listens of a user, newest first, skipping songs removed from the library. */
export function listRecentListens(userId: string, limit: number, offset: number): Promise<ListenWithSong[]> {
  return prisma.listen.findMany({
    where: { userId, songId: { not: null } },
    include: { song: true },
    orderBy: { listenedAt: 'desc' },
    take: limit,
    skip: offset
  })
}

export function countListens(userId: string): Promise<number> {
  return prisma.listen.count({ where: { userId, songId: { not: null } } })
}

// --- Accounts ------------------------------------------------------------

export function listScrobbleAccounts(userId: string): Promise<ScrobbleAccount[]> {
  return prisma.scrobbleAccount.findMany({ where: { userId }, orderBy: { provider: 'asc' } })
}

export function listEnabledScrobbleAccounts(userId: string): Promise<ScrobbleAccount[]> {
  return prisma.scrobbleAccount.findMany({ where: { userId, enabled: true } })
}

export function findScrobbleAccount(userId: string, provider: ScrobbleProviderId): Promise<ScrobbleAccount | null> {
  return prisma.scrobbleAccount.findUnique({ where: { userId_provider: { userId, provider } } })
}

export interface UpsertScrobbleAccountInput {
  userId: string
  provider: ScrobbleProviderId
  enabled: boolean
  apiRoot: string | null
  encryptedToken: string
  username: string | null
}

export function upsertScrobbleAccount(input: UpsertScrobbleAccountInput): Promise<ScrobbleAccount> {
  const { userId, provider, ...rest } = input
  return prisma.scrobbleAccount.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, ...rest, lastError: null },
    update: { ...rest, lastError: null }
  })
}

export function updateScrobbleAccount(
  id: number,
  data: { enabled?: boolean; apiRoot?: string | null; username?: string | null; lastError?: string | null }
): Promise<ScrobbleAccount> {
  return prisma.scrobbleAccount.update({ where: { id }, data })
}

export async function deleteScrobbleAccount(userId: string, provider: ScrobbleProviderId): Promise<void> {
  await prisma.scrobbleAccount.deleteMany({ where: { userId, provider } })
}

// --- Retry queue ---------------------------------------------------------

export async function enqueueListen(accountId: number, payload: ListenPayload): Promise<void> {
  await prisma.scrobbleQueueItem.create({
    data: { accountId, payload: JSON.stringify(payload), nextAttemptAt: new Date() }
  })
}

/** Queued listens for an account that are due for another attempt, oldest first. */
export function findDueQueueItems(accountId: number, limit: number): Promise<ScrobbleQueueItem[]> {
  return prisma.scrobbleQueueItem.findMany({
    where: { accountId, nextAttemptAt: { lte: new Date() } },
    orderBy: { id: 'asc' },
    take: limit
  })
}

export function countQueueItems(accountId: number): Promise<number> {
  return prisma.scrobbleQueueItem.count({ where: { accountId } })
}

export async function deleteQueueItems(ids: number[]): Promise<void> {
  await prisma.scrobbleQueueItem.deleteMany({ where: { id: { in: ids } } })
}

export async function rescheduleQueueItems(ids: number[], error: string, nextAttemptAt: Date): Promise<void> {
  await prisma.scrobbleQueueItem.updateMany({
    where: { id: { in: ids } },
    data: { attempts: { increment: 1 }, lastError: error, nextAttemptAt }
  })
}

export async function deleteAccountQueue(accountId: number): Promise<void> {
  await prisma.scrobbleQueueItem.deleteMany({ where: { accountId } })
}

import type { Playlist as PlaylistRow } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

export type { PlaylistRow }

export interface CreatePlaylistInput {
  userId: string
  name: string
  isPublic: boolean
}

export interface UpdatePlaylistInput {
  name?: string
  isPublic?: boolean
}

export function listPlaylistsByUser(userId: string): Promise<PlaylistRow[]> {
  return prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export function listPublicPlaylists(excludeUserId: string): Promise<PlaylistRow[]> {
  return prisma.playlist.findMany({
    where: { isPublic: true, NOT: { userId: excludeUserId } },
    orderBy: { createdAt: 'desc' }
  })
}

export function createPlaylist(data: CreatePlaylistInput): Promise<PlaylistRow> {
  return prisma.playlist.create({ data })
}

export function findPlaylistById(id: number): Promise<PlaylistRow | null> {
  return prisma.playlist.findUnique({ where: { id } })
}

export function updatePlaylist(id: number, data: UpdatePlaylistInput): Promise<PlaylistRow> {
  return prisma.playlist.update({ where: { id }, data })
}

export function deletePlaylist(id: number): Promise<void> {
  return prisma.playlist.delete({ where: { id } }).then(() => undefined)
}

/** Adds songs to the end of the playlist, ignoring songs already present. Returns count added. */
export async function addSongsToPlaylist(playlistId: number, songIds: number[]): Promise<number> {
  if (songIds.length === 0) return 0

  const existing = await prisma.playlistItem.findMany({
    where: { playlistId, songId: { in: songIds } },
    select: { songId: true }
  })
  const existingSet = new Set(existing.map(e => e.songId))
  const toAdd = songIds.filter(id => !existingSet.has(id))
  if (toAdd.length === 0) return 0

  const maxRow = await prisma.playlistItem.aggregate({
    where: { playlistId },
    _max: { sortIndex: true }
  })
  let nextIndex = (maxRow._max.sortIndex ?? -1) + 1

  await prisma.playlistItem.createMany({
    data: toAdd.map(songId => ({ playlistId, songId, sortIndex: nextIndex++ }))
  })

  return toAdd.length
}

export function removeSongFromPlaylist(playlistId: number, songId: number): Promise<void> {
  return prisma.playlistItem
    .deleteMany({ where: { playlistId, songId } })
    .then(() => undefined)
}

export async function removeSongsFromPlaylist(playlistId: number, songIds: number[]): Promise<number> {
  if (songIds.length === 0) return 0
  const { count } = await prisma.playlistItem.deleteMany({ where: { playlistId, songId: { in: songIds } } })
  return count
}

/** Rewrites sortIndex to match the given song order. Songs not listed keep trailing order. */
export async function reorderPlaylistItems(playlistId: number, orderedSongIds: number[]): Promise<void> {
  await prisma.$transaction(
    orderedSongIds.map((songId, index) =>
      prisma.playlistItem.updateMany({
        where: { playlistId, songId },
        data: { sortIndex: index }
      })
    )
  )
}

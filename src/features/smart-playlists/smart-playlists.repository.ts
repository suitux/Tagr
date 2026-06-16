import type { SmartPlaylist as SmartPlaylistRow } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

export type { SmartPlaylistRow }

export interface CreateSmartPlaylistInput {
  userId: string
  name: string
  rules: string
  isPublic: boolean
}

export interface UpdateSmartPlaylistInput {
  name?: string
  rules?: string
  isPublic?: boolean
}

export function listSmartPlaylistsByUser(userId: string): Promise<SmartPlaylistRow[]> {
  return prisma.smartPlaylist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export function listPublicSmartPlaylists(excludeUserId: string): Promise<SmartPlaylistRow[]> {
  return prisma.smartPlaylist.findMany({
    where: { isPublic: true, NOT: { userId: excludeUserId } },
    orderBy: { createdAt: 'desc' }
  })
}

export function createSmartPlaylist(data: CreateSmartPlaylistInput): Promise<SmartPlaylistRow> {
  return prisma.smartPlaylist.create({ data })
}

export function findSmartPlaylistById(id: number): Promise<SmartPlaylistRow | null> {
  return prisma.smartPlaylist.findUnique({ where: { id } })
}

export function updateSmartPlaylist(id: number, data: UpdateSmartPlaylistInput): Promise<SmartPlaylistRow> {
  return prisma.smartPlaylist.update({ where: { id }, data })
}

export function deleteSmartPlaylist(id: number): Promise<void> {
  return prisma.smartPlaylist.delete({ where: { id } }).then(() => undefined)
}

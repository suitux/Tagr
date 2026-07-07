import { Playlist } from '@/features/playlists/domain'

export function createPlaylistObject(
  row: {
    id: number
    userId: string
    name: string
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
  },
  currentUserId: string
): Playlist {
  return {
    id: row.id,
    name: row.name,
    isPublic: row.isPublic,
    ownerId: row.userId,
    isOwner: row.userId === currentUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

import { parseRules, SmartPlaylist } from '@/features/smart-playlists/domain'

export function createSmartPlaylistObject(
  row: {
    id: number
    userId: string
    name: string
    rules: string
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
  },
  currentUserId: string
): SmartPlaylist {
  return {
    id: row.id,
    name: row.name,
    isPublic: row.isPublic,
    ownerId: row.userId,
    isOwner: row.userId === currentUserId,
    rules: parseRules(row.rules),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

import { SmartPlaylist } from '@/features/smart-playlists/domain'
import { parseSmartListRules } from '@/features/smart-playlists/helpers'

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
    rules: parseSmartListRules(row.rules),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

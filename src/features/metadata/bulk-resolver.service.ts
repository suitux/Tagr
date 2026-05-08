import { getSongIdsByFolder, getSongIdsByPlaylist } from '@/features/metadata/metadata-scan.service'
import { parseSmartListRules } from '@/features/smart-playlists/helpers'
import { BULK_RESOLVE_LIMIT, type BulkTarget } from '@/features/songs/bulk-target'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

export class BulkResolveError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
  }
}

interface ResolveOptions {
  /** When provided, the playlist's userId/isPublic will be checked against this user. */
  userId?: string
}

export async function resolveBulkTargetIds(target: BulkTarget, options?: ResolveOptions): Promise<number[]> {
  if (target.mode === 'ids') {
    if (!Array.isArray(target.songIds) || target.songIds.some(id => typeof id !== 'number' || !Number.isFinite(id))) {
      throw new BulkResolveError('Invalid songIds', 400)
    }
    if (target.songIds.length > BULK_RESOLVE_LIMIT) {
      throw new BulkResolveError(`Too many songs (limit: ${BULK_RESOLVE_LIMIT})`, 400)
    }
    return [...new Set(target.songIds)]
  }

  if (target.mode !== 'all-in-context') {
    throw new BulkResolveError('Invalid bulk target mode', 400)
  }

  const exclusions = new Set(target.exclusions ?? [])
  let ids: number[]

  if (target.context.type === 'folder') {
    const folderPath = target.context.folderPath === ALL_SONGS_FOLDER_ID ? null : target.context.folderPath
    ids = await getSongIdsByFolder(folderPath, target.search, target.filters, BULK_RESOLVE_LIMIT + 1)
  } else if (target.context.type === 'smart-playlist') {
    const playlist = await prisma.smartPlaylist.findUnique({ where: { id: target.context.playlistId } })
    if (!playlist) throw new BulkResolveError('Playlist not found', 404)

    if (options?.userId !== undefined && playlist.userId !== options.userId && !playlist.isPublic) {
      throw new BulkResolveError('Forbidden', 403)
    }

    const rules = parseSmartListRules(playlist.rules)
    ids = await getSongIdsByPlaylist(rules, target.search, target.filters, BULK_RESOLVE_LIMIT + 1)
  } else {
    throw new BulkResolveError('Invalid context', 400)
  }

  if (ids.length > BULK_RESOLVE_LIMIT) {
    throw new BulkResolveError(`Too many songs in selection (limit: ${BULK_RESOLVE_LIMIT})`, 400)
  }

  if (exclusions.size === 0) return ids
  return ids.filter(id => !exclusions.has(id))
}

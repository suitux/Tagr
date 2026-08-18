import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

/**
 * Folder paths are absolute filesystem paths ('/music/Rock/2020') and become the catch-all
 * segments of /library/[[...path]]. The sentinel ALL_SONGS_FOLDER_ID maps to no segments at all,
 * so '/library' is the "all songs" view.
 */
export function folderPathToSegments(folderPath: string): string[] {
  if (folderPath === ALL_SONGS_FOLDER_ID) return []

  return folderPath
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
}

/**
 * Next.js already decodes route params, so segments must not be decoded again here.
 */
export function segmentsToFolderPath(segments?: string[]): string {
  if (!segments || segments.length === 0) return ALL_SONGS_FOLDER_ID

  return `/${segments.join('/')}`
}

export function buildFolderHref(folderPath: string): string {
  const segments = folderPathToSegments(folderPath)

  return segments.length === 0 ? '/library' : `/library/${segments.join('/')}`
}

export function buildPlaylistHref(playlistId: number): string {
  return `/smart-playlists/${playlistId}`
}

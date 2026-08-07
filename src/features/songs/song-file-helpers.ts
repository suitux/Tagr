export { isMusicFile } from 'audiotagr/tags'

export const DEFAULT_MUSIC_FOLDER = '/music'

export function getMusicFolders(): string[] {
  const foldersEnv = process.env.MUSIC_FOLDERS
  if (!foldersEnv) {
    return [DEFAULT_MUSIC_FOLDER]
  }
  return foldersEnv
    .split(',')
    .map(folder => folder.trim())
    .filter(folder => folder.length > 0)
}

export function getSongPictureUrl(songId: number, cacheBust?: string | Date | null): string {
  const base = `/api/songs/${songId}/picture`
  if (!cacheBust) return base
  const t = cacheBust instanceof Date ? cacheBust.getTime() : cacheBust
  return `${base}?t=${t}`
}

export function getSongAudioUrl(songId: number): string {
  return `/api/songs/${songId}/audio`
}

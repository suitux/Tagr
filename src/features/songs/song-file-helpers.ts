import path from 'path'
import { MUSIC_EXTENSIONS, MusicExtension } from '@/features/songs/domain'

export function getMusicFolders(): string[] {
  const foldersEnv = process.env.MUSIC_FOLDERS || ''
  return foldersEnv
    .split(',')
    .map(folder => folder.trim())
    .filter(folder => folder.length > 0)
}

export function isMusicFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return MUSIC_EXTENSIONS.includes(ext.toLowerCase() as MusicExtension)
}

export function getSongPictureUrl(songId: number): string {
  return `/api/songs/${songId}/picture`
}

export function getSongAudioUrl(songId: number): string {
  return `/api/songs/${songId}/audio`
}

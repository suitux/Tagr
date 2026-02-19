import path from 'path'

export const MUSIC_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.aiff'] as const
export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]

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

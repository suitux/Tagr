import { MUSIC_EXTENSIONS } from '../shared/constants'
import { MusicExtension } from '../shared/domain'

/**
 * True when a filename looks like a supported audio file. macOS resource forks
 * (`._name.mp3`) are rejected: they carry the extension but no audio.
 *
 * Implemented without `path` so it stays usable in the browser.
 */
export function isMusicFile(filename: string): boolean {
  if (filename.startsWith('._')) return false

  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex <= 0) return false

  return MUSIC_EXTENSIONS.includes(filename.slice(dotIndex).toLowerCase() as MusicExtension)
}

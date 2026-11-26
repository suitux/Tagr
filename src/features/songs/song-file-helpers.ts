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

/** Per-root folder songs are moved to when deleted; see `features/trash`. */
export const TRASH_FOLDER_NAME = '__tagr_trash__'

/** Folders never shown nor scanned: hidden folders plus NAS/OS system folders, matched by name. */
export const DEFAULT_EXCLUDED_FOLDERS: RegExp[] = [
  /^\./, // hidden folders (.Trash, .AppleDouble, .@__thumb, …)
  /^@eaDir$/i, // Synology thumbnails / media indexing
  /^#recycle$/i, // Synology recycle bin
  /^@Recycle$/i, // QNAP recycle bin
  /^#snapshot$/i,
  /^@Recently-Snapshot$/i,
  /^\$RECYCLE\.BIN$/i,
  /^System Volume Information$/i,
  /^lost\+found$/,
  new RegExp(`^${TRASH_FOLDER_NAME}$`)
]

let excludedFolderPatterns: RegExp[] | undefined

/** Syntax only a regex uses: escapes, anchors, groups, classes, quantifiers, alternation, or `.*` / `.+` / `.?`. */
const REGEX_SYNTAX = /[\\^$+()[\]{}|]|\.[*+?]/

/** `*` → any run of characters, `?` → one character; everything else is literal. */
function globToRegexSource(glob: string): string {
  return glob
    .split('')
    .map(char => {
      if (char === '*') return '.*'
      if (char === '?') return '.'
      return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
}

/**
 * An `EXCLUDE_FOLDERS` entry is a regex when it uses regex-only syntax (`.*_backup`, `Temp\d+`),
 * otherwise a glob (`*test*`, `Temp?`) — so a plain name like `Vol. 1` matches literally.
 */
function compileExcludePattern(pattern: string): RegExp | undefined {
  const source = REGEX_SYNTAX.test(pattern) ? pattern : globToRegexSource(pattern)
  try {
    return new RegExp(`^(?:${source})$`, 'i')
  } catch {
    console.warn(`EXCLUDE_FOLDERS: ignoring invalid pattern "${pattern}"`)
    return undefined
  }
}

/**
 * Defaults plus `EXCLUDE_FOLDERS`: comma-separated folder names, globs or regex patterns, each matched
 * case-insensitively against the whole folder name.
 */
export function getExcludedFolderPatterns(): RegExp[] {
  if (excludedFolderPatterns) return excludedFolderPatterns

  const custom = (process.env.EXCLUDE_FOLDERS ?? '')
    .split(',')
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.length > 0)
    .flatMap(pattern => compileExcludePattern(pattern) ?? [])

  excludedFolderPatterns = [...DEFAULT_EXCLUDED_FOLDERS, ...custom]
  return excludedFolderPatterns
}

export function isExcludedFolder(name: string): boolean {
  return getExcludedFolderPatterns().some(pattern => pattern.test(name))
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

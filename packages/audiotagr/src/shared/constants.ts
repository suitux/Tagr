/** File extensions treated as audio files by the scanner. */
export const MUSIC_EXTENSIONS = [
  '.mp3',
  '.flac',
  '.wav',
  '.aac',
  '.ogg',
  '.m4a',
  '.m4b',
  '.wma',
  '.aiff',
  '.opus'
] as const

/**
 * Separator used to flatten multi-value tags (artists, genres, composers…) into
 * a single string and to split them back apart before writing.
 */
export const FIELD_MULTI_VALUE_SEPARATOR = ';'

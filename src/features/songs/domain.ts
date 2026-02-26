import type { Song as PrismaSong } from '@/generated/prisma/client'

export type Song = PrismaSong

export type SongSortField =
  | 'title'
  | 'artist'
  | 'sortArtist'
  | 'album'
  | 'sortAlbum'
  | 'trackNumber'
  | 'trackTotal'
  | 'discNumber'
  | 'discTotal'
  | 'year'
  | 'bpm'
  | 'genre'
  | 'albumArtist'
  | 'sortAlbumArtist'
  | 'composer'
  | 'conductor'
  | 'comment'
  | 'grouping'
  | 'publisher'
  | 'catalogNumber'
  | 'lyricist'
  | 'barcode'
  | 'work'
  | 'originalReleaseDate'
  | 'copyright'
  | 'rating'
  | 'compilation'
  | 'duration'
  | 'bitrate'
  | 'sampleRate'
  | 'channels'
  | 'bitsPerSample'
  | 'encoder'
  | 'fileName'
  | 'fileSize'
  | 'extension'
  | 'createdAt'
  | 'modifiedAt'
  | 'dateAdded'
  | 'lastPlayed'
  | 'playCount'
export type SongSortDirection = 'asc' | 'desc'

export type SongColumnFilters = Partial<Record<SongSortField, string>>

export const NUMERIC_SONG_FIELDS: Set<SongSortField> = new Set([
  'trackNumber',
  'trackTotal',
  'discNumber',
  'discTotal',
  'year',
  'bpm',
  'rating',
  'playCount',
  'duration',
  'bitrate',
  'sampleRate',
  'channels',
  'bitsPerSample',
  'fileSize'
])

export const BOOLEAN_SONG_FIELDS: Set<SongSortField> = new Set(['compilation'])

export const DATE_SONG_FIELDS: Set<SongSortField> = new Set([
  'dateAdded',
  'lastPlayed',
  'modifiedAt',
  'createdAt',
  'originalReleaseDate'
])

export const MUSIC_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.aiff'] as const
export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]

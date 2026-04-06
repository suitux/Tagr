import type { Song as PrismaSong, SongMetadata } from '@/generated/prisma/client'

export type Song = PrismaSong

export const ALL_SONGS_FOLDER_ID = '__all__'

export type SongWithMetadata = Song & {
  metadata: SongMetadata[]
}

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
  'bitrate',
  'sampleRate',
  'channels',
  'bitsPerSample',
  'fileSize'
])

export const DURATION_SONG_FIELDS: Set<SongSortField> = new Set(['duration'])

export const BOOLEAN_SONG_FIELDS: Set<SongSortField> = new Set(['compilation'])

export const SELECT_SONG_FIELDS: Set<SongSortField> = new Set([
  'genre',
  'publisher',
  'albumArtist',
  'composer',
  'conductor',
  'extension',
  'encoder'
])

export const DATE_SONG_FIELDS: Set<SongSortField> = new Set([
  'dateAdded',
  'lastPlayed',
  'modifiedAt',
  'createdAt',
  'originalReleaseDate'
])

export const MULTI_VALUE_SEPARATOR = '||'

export const MUSIC_EXTENSIONS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.aiff', '.opus'] as const
export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]

export const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.wma': 'audio/x-ms-wma',
  '.aiff': 'audio/aiff'
}

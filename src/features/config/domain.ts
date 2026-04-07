import { ColumnField } from '@/features/songs/domain'

export type ConfigKey = 'columnVisibility' | 'dismissedVersion' | 'starPromptDismissed'

export type ColumnVisibilityState = {
  [key in ColumnField]: boolean
}

export const DEFAULT_VISIBLE_COLUMNS: ColumnVisibilityState = {
  title: true,
  artist: true,
  album: true,
  year: false,
  genre: true,
  bpm: true,
  duration: false,
  fileSize: false,
  modifiedAt: false,
  sortArtist: false,
  sortAlbum: false,
  trackNumber: false,
  trackTotal: false,
  discNumber: false,
  discTotal: false,
  albumArtist: false,
  sortAlbumArtist: false,
  composer: false,
  conductor: false,
  comment: false,
  grouping: false,
  publisher: false,
  catalogNumber: false,
  lyricist: false,
  barcode: false,
  work: false,
  originalReleaseDate: false,
  copyright: false,
  rating: false,
  compilation: false,
  bitrate: false,
  sampleRate: false,
  channels: false,
  bitsPerSample: false,
  encoder: false,
  fileName: false,
  extension: false,
  createdAt: false,
  dateAdded: false,
  lastPlayed: false,
  playCount: false
} as ColumnVisibilityState

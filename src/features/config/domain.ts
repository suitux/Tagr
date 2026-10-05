import type { MusicBrainzSearchField } from '@/features/musicbrainz/domain'
import { ColumnField, SongSortDirection } from '@/features/songs/domain'
import type { BulkEditableField } from '@/features/songs/song-fields'

export type ConfigKey =
  | 'columnVisibility'
  | 'dismissedVersion'
  | 'starPromptDismissed'
  | 'sortOrder'
  | 'musicbrainzSearchFields'
  | 'bulkEditFields'

/** Which inputs the MusicBrainz lookup form shows. */
export type MusicBrainzSearchFieldsState = Record<MusicBrainzSearchField, boolean>

/**
 * Which rows the bulk edit form shows. A standard field is visible unless listed in `hidden`, so an
 * absent config keeps the original behaviour of showing every field.
 */
export type BulkEditFieldsState = {
  hidden?: BulkEditableField[]
  /** Extended tag keys (uppercase, no prefix) rendered as extra rows. */
  custom?: string[]
}

export const DEFAULT_BULK_EDIT_FIELDS: BulkEditFieldsState = {}

export type SortOrderState = {
  sortField?: ColumnField
  sort?: SongSortDirection
}

export const DEFAULT_SORT_ORDER: SortOrderState = {}

export type ColumnVisibilityState = {
  [key in ColumnField]: boolean
}

export const DEFAULT_VISIBLE_COLUMNS: ColumnVisibilityState = {
  title: true,
  artist: true,
  album: true,
  year: false,
  genre: true,
  style: false,
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
  releaseType: false,
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

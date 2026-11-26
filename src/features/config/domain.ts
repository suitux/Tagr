import type { MusicBrainzSearchField } from '@/features/musicbrainz/domain'
import { ColumnField, SongSortDirection } from '@/features/songs/domain'
import type { DetailPanelField } from '@/features/songs/detail-panel-fields'
import type { BulkEditableField } from '@/features/songs/song-fields'

export type ConfigKey =
  | 'columnVisibility'
  | 'dismissedVersion'
  | 'starPromptDismissed'
  | 'sortOrder'
  | 'defaultSortOrder'
  | 'musicbrainzSearchFields'
  | 'bulkEditFields'
  | 'detailPanelFields'
  | 'locale'

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

/**
 * Which rows the song detail panel shows. Both lists name what is hidden, so an absent config shows
 * everything and a custom tag seen for the first time shows up until it is hidden.
 */
export type DetailPanelFieldsState = {
  hidden?: DetailPanelField[]
  /** Extended tag keys (uppercase, no prefix). */
  hiddenCustom?: string[]
}

export const DEFAULT_DETAIL_PANEL_FIELDS: DetailPanelFieldsState = {}

export type SortOrderState = {
  sortField?: ColumnField
  sort?: SongSortDirection
}

export const DEFAULT_SORT_ORDER: SortOrderState = {}

/**
 * The order the list falls back to while no column is sorted (`sortOrder` is empty). It is a user
 * setting, unlike `sortOrder`, which only remembers the column header that was clicked last.
 */
export type DefaultSortOrderState = Required<SortOrderState>

export const DEFAULT_SORT_PREFERENCE: DefaultSortOrderState = { sortField: 'title', sort: 'asc' }

/** Reads a stored `defaultSortOrder`, falling back to {@link DEFAULT_SORT_PREFERENCE} on anything malformed. */
export function toDefaultSortOrder(value: unknown): DefaultSortOrderState {
  const { sortField, sort } = (value ?? {}) as SortOrderState
  if (typeof sortField !== 'string' || !sortField) return DEFAULT_SORT_PREFERENCE
  return { sortField, sort: sort === 'desc' ? 'desc' : 'asc' }
}

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
  trackNumber: true,
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

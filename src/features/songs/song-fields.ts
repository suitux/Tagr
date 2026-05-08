import type { SongMetadataUpdate } from '@/features/metadata/domain'

export type BulkEditableField = keyof Omit<SongMetadataUpdate, 'lyrics' | 'customMetadata' | 'volume' | 'startTime' | 'stopTime' | 'gapless'>

export type BulkFieldType = 'text' | 'number' | 'date' | 'boolean' | 'rating'

export type BulkFieldSection = 'music' | 'track' | 'misc'

export interface BulkFieldDescriptor {
  key: BulkEditableField
  labelKey: string
  type: BulkFieldType
  section: BulkFieldSection
}

export const BULK_EDITABLE_FIELDS: BulkFieldDescriptor[] = [
  { key: 'title', labelKey: 'title', type: 'text', section: 'music' },
  { key: 'artist', labelKey: 'artist', type: 'text', section: 'music' },
  { key: 'sortArtist', labelKey: 'sortArtist', type: 'text', section: 'music' },
  { key: 'album', labelKey: 'album', type: 'text', section: 'music' },
  { key: 'sortAlbum', labelKey: 'sortAlbum', type: 'text', section: 'music' },
  { key: 'albumArtist', labelKey: 'albumArtist', type: 'text', section: 'music' },
  { key: 'sortAlbumArtist', labelKey: 'sortAlbumArtist', type: 'text', section: 'music' },
  { key: 'genre', labelKey: 'genre', type: 'text', section: 'music' },
  { key: 'composer', labelKey: 'composer', type: 'text', section: 'music' },
  { key: 'conductor', labelKey: 'conductor', type: 'text', section: 'music' },
  { key: 'year', labelKey: 'year', type: 'number', section: 'music' },
  { key: 'bpm', labelKey: 'bpm', type: 'number', section: 'music' },
  { key: 'grouping', labelKey: 'grouping', type: 'text', section: 'music' },
  { key: 'publisher', labelKey: 'publisher', type: 'text', section: 'music' },
  { key: 'catalogNumber', labelKey: 'catalogNumber', type: 'text', section: 'music' },
  { key: 'lyricist', labelKey: 'lyricist', type: 'text', section: 'music' },
  { key: 'barcode', labelKey: 'barcode', type: 'text', section: 'music' },
  { key: 'work', labelKey: 'work', type: 'text', section: 'music' },
  { key: 'originalReleaseDate', labelKey: 'originalReleaseDate', type: 'date', section: 'music' },
  { key: 'copyright', labelKey: 'copyright', type: 'text', section: 'music' },
  { key: 'rating', labelKey: 'rating', type: 'rating', section: 'music' },
  { key: 'compilation', labelKey: 'compilation', type: 'boolean', section: 'music' },

  { key: 'trackNumber', labelKey: 'trackNumber', type: 'number', section: 'track' },
  { key: 'trackTotal', labelKey: 'trackTotal', type: 'number', section: 'track' },
  { key: 'discNumber', labelKey: 'discNumber', type: 'number', section: 'track' },
  { key: 'discTotal', labelKey: 'discTotal', type: 'number', section: 'track' },

  { key: 'comment', labelKey: 'comment', type: 'text', section: 'misc' }
]

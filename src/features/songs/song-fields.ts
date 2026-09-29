import type { SongMetadataUpdate } from '@/features/metadata/domain'

export type BulkEditableField = keyof Omit<SongMetadataUpdate, 'lyrics' | 'customMetadata' | 'volume' | 'startTime' | 'stopTime' | 'gapless'>

export type BulkFieldType = 'text' | 'number' | 'date' | 'boolean' | 'rating'

export type BulkFieldSection = 'music' | 'track' | 'misc' | 'custom'

/** Extended tag keys are namespaced so they can share the form state with the standard fields. */
export const CUSTOM_FIELD_PREFIX = 'custom:'

export type CustomBulkFieldKey = `${typeof CUSTOM_FIELD_PREFIX}${string}`

export type BulkFormFieldKey = BulkEditableField | CustomBulkFieldKey

export interface StandardBulkFieldDescriptor {
  key: BulkEditableField
  labelKey: string
  type: BulkFieldType
  section: Exclude<BulkFieldSection, 'custom'>
  custom?: false
}

export interface CustomBulkFieldDescriptor {
  key: CustomBulkFieldKey
  /** The raw tag key — extended tags have no translation. */
  label: string
  type: 'text'
  section: 'custom'
  custom: true
}

export type BulkFieldDescriptor = StandardBulkFieldDescriptor | CustomBulkFieldDescriptor

export function toCustomFieldKey(tagKey: string): CustomBulkFieldKey {
  return `${CUSTOM_FIELD_PREFIX}${tagKey}`
}

export function isCustomBulkField(key: BulkFormFieldKey): key is CustomBulkFieldKey {
  return key.startsWith(CUSTOM_FIELD_PREFIX)
}

export function getCustomTagKey(key: CustomBulkFieldKey): string {
  return key.slice(CUSTOM_FIELD_PREFIX.length)
}

export function buildCustomFieldDescriptor(tagKey: string): CustomBulkFieldDescriptor {
  return { key: toCustomFieldKey(tagKey), label: tagKey, type: 'text', section: 'custom', custom: true }
}

export const BULK_EDITABLE_FIELDS: StandardBulkFieldDescriptor[] = [
  { key: 'title', labelKey: 'title', type: 'text', section: 'music' },
  { key: 'artist', labelKey: 'artist', type: 'text', section: 'music' },
  { key: 'sortArtist', labelKey: 'sortArtist', type: 'text', section: 'music' },
  { key: 'album', labelKey: 'album', type: 'text', section: 'music' },
  { key: 'sortAlbum', labelKey: 'sortAlbum', type: 'text', section: 'music' },
  { key: 'albumArtist', labelKey: 'albumArtist', type: 'text', section: 'music' },
  { key: 'sortAlbumArtist', labelKey: 'sortAlbumArtist', type: 'text', section: 'music' },
  { key: 'genre', labelKey: 'genre', type: 'text', section: 'music' },
  { key: 'style', labelKey: 'style', type: 'text', section: 'music' },
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

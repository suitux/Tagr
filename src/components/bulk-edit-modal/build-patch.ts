import { type MetadataInput, type SongMetadataUpdate } from '@/features/metadata/domain'
import {
  BULK_EDITABLE_FIELDS,
  getCustomTagKey,
  isCustomBulkField,
  type BulkFormFieldKey
} from '@/features/songs/song-fields'

export type FormShape = Record<BulkFormFieldKey, string>

export interface BulkPatch {
  /** Standard song columns, in the shape the bulk route's `metadata` expects. */
  metadata: Partial<SongMetadataUpdate>
  /** Extended tags, in the shape the bulk route's `customMetadata` expects. */
  customMetadata: MetadataInput[]
}

export function isEmptyBulkPatch(patch: BulkPatch): boolean {
  return Object.keys(patch.metadata).length === 0 && patch.customMetadata.length === 0
}

/**
 * Build the PATCH payload from the user-touched form fields.
 * - Empty string → null (clear the tag on disk; for an extended tag that removes it).
 * - Numeric / rating → Number(...) when finite.
 * - Boolean → "true"/"false" string → boolean.
 * - Date → ISO string passthrough.
 * - Other → trimmed string value.
 */
export function buildBulkPatch(values: FormShape, touched: Set<BulkFormFieldKey>): BulkPatch {
  const metadata: Partial<SongMetadataUpdate> = {}
  const customMetadata: MetadataInput[] = []

  for (const key of touched) {
    const v = values[key] ?? ''

    if (isCustomBulkField(key)) {
      customMetadata.push({ key: getCustomTagKey(key), value: v === '' ? null : v })
      continue
    }

    const descriptor = BULK_EDITABLE_FIELDS.find(field => field.key === key)
    if (!descriptor) continue

    if (v === '') {
      ;(metadata as Record<string, unknown>)[key] = null
      continue
    }

    switch (descriptor.type) {
      case 'number':
      case 'rating': {
        const n = Number(v)
        if (Number.isFinite(n)) (metadata as Record<string, unknown>)[key] = n
        break
      }
      case 'boolean':
        ;(metadata as Record<string, unknown>)[key] = v === 'true'
        break
      case 'date':
        ;(metadata as Record<string, unknown>)[key] = v
        break
      default:
        ;(metadata as Record<string, unknown>)[key] = v
    }
  }

  return { metadata, customMetadata }
}

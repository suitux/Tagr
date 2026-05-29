import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { BULK_EDITABLE_FIELDS, type BulkEditableField } from '@/features/songs/song-fields'

export type FormShape = Record<BulkEditableField, string>

/**
 * Build the PATCH payload from the user-touched form fields.
 * - Empty string → null (clear the tag on disk).
 * - Numeric / rating → Number(...) when finite.
 * - Boolean → "true"/"false" string → boolean.
 * - Date → ISO string passthrough.
 * - Other → trimmed string value.
 */
export function buildBulkPatch(values: FormShape, touched: Set<BulkEditableField>): Partial<SongMetadataUpdate> {
  const patch: Partial<SongMetadataUpdate> = {}
  for (const key of touched) {
    const descriptor = BULK_EDITABLE_FIELDS.find(field => field.key === key)
    if (!descriptor) continue

    const v = values[key] ?? ''
    if (v === '') {
      ;(patch as Record<string, unknown>)[key] = null
      continue
    }

    switch (descriptor.type) {
      case 'number':
      case 'rating': {
        const n = Number(v)
        if (Number.isFinite(n)) (patch as Record<string, unknown>)[key] = n
        break
      }
      case 'boolean':
        ;(patch as Record<string, unknown>)[key] = v === 'true'
        break
      case 'date':
        ;(patch as Record<string, unknown>)[key] = v
        break
      default:
        ;(patch as Record<string, unknown>)[key] = v
    }
  }
  return patch
}

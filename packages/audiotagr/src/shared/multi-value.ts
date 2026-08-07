import { FIELD_MULTI_VALUE_SEPARATOR } from './constants'

/** Join multi-value tag entries into a single field string, dropping empties. */
export function joinMultiValue(values: (string | null | undefined)[]): string | null {
  const filtered = values.filter(Boolean).join(FIELD_MULTI_VALUE_SEPARATOR)
  return filtered || null
}

/** Split a flattened field string back into its individual values. */
export function splitMultiValue(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(FIELD_MULTI_VALUE_SEPARATOR).filter(Boolean)
}

/**
 * Reduce a namespaced custom-tag key (`ID3v2.4:TXXX:MOOD`) to its last segment
 * (`MOOD`), so the same logical tag matches across formats.
 */
export function stripKeyPrefix(key: string): string {
  const parts = key.split(':')
  return parts[parts.length - 1].toUpperCase()
}

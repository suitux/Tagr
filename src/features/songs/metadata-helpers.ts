export function stripKeyPrefix(key: string): string {
  const parts = key.split(':')
  return parts[parts.length - 1].toUpperCase()
}

export const FIELD_MULTI_VALUE_SEPARATOR = ';'

export function joinMultiValue(values: (string | null | undefined)[]): string | null {
  const filtered = values.filter(Boolean).join(FIELD_MULTI_VALUE_SEPARATOR)
  return filtered || null
}

export function splitMultiValue(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(FIELD_MULTI_VALUE_SEPARATOR).filter(Boolean)
}

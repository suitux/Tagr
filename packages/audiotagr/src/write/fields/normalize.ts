/**
 * taglib's convenience properties clear a tag when given an empty string or a
 * zero, and the native writers clear it when given `undefined`. These adapt the
 * patch's `T | null` values to each convention.
 */

export function asText(value: string | null | undefined): string {
  return value ?? ''
}

export function asNumber(value: number | null | undefined): number {
  return value ?? 0
}

/** Empty and `null` both mean "remove this tag" for native writers. */
export function asOptionalText(value: string | null | undefined): string | undefined {
  return value ? value : undefined
}

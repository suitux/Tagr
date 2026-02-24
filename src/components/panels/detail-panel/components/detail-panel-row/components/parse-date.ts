import { isValid, parse, parseISO } from 'date-fns'

export function parseDate(value: string | number | null | undefined): Date | undefined {
  if (!value) return undefined
  const str = String(value)
  // Try ISO format first
  const isoDate = parseISO(str)
  if (isValid(isoDate)) return isoDate
  // Try YYYY-MM-DD
  const parsed = parse(str, 'yyyy-MM-dd', new Date())
  if (isValid(parsed)) return parsed
  // Try YYYY
  if (/^\d{4}$/.test(str)) {
    return new Date(Number(str), 0, 1)
  }
  return undefined
}

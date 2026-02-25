import { format, isSameDay, isValid, parse, parseISO } from 'date-fns'

export const ISO_DATE_FORMAT = 'yyyy-MM-dd'
export const DISPLAY_DATE_FORMAT = 'MMM d'
export const FULL_DATE_FORMAT = 'dd MMMM yyyy, HH:mm'

export function formatDate(date: Date | null, fmt: string = ISO_DATE_FORMAT): string | null {
  if (!date) return null
  return format(new Date(date), fmt)
}

export function formatDateRange(from: Date, to: Date): string {
  const fromStr = formatDate(from, DISPLAY_DATE_FORMAT)!
  if (isSameDay(from, to)) return fromStr
  return `${fromStr} – ${formatDate(to, DISPLAY_DATE_FORMAT)}`
}

export function parseDate(value: string | number | null | undefined): Date | undefined {
  if (!value) return undefined
  const str = String(value)
  const isoDate = parseISO(str)
  if (isValid(isoDate)) return isoDate
  const parsed = parse(str, ISO_DATE_FORMAT, new Date())
  if (isValid(parsed)) return parsed
  if (/^\d{4}$/.test(str)) {
    return new Date(Number(str), 0, 1)
  }
  return undefined
}

export function parseIsoDate(value: string): Date {
  return parse(value, ISO_DATE_FORMAT, new Date())
}

export { isSameDay } from 'date-fns'

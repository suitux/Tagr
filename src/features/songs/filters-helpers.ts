import { ColumnField, SongColumnFilters } from '@/features/songs/domain'

export const getSongFiltersFromSearchParams = (searchParams: URLSearchParams) => {
  const filters: SongColumnFilters = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.') && value) {
      const field = key.slice(7) as ColumnField
      filters[field] = value
    }
  }

  return { filters, hasFilters: Object.keys(filters).length > 0 }
}

/**
 * Parses a `YYYY-MM-DD..YYYY-MM-DD` column filter (either end optional) into a Prisma range.
 * Returns null when neither end is set, so callers can skip the condition entirely.
 */
export const parseDateRangeFilter = (value: string): { gte?: Date; lte?: Date } | null => {
  const [fromStr, toStr] = value.split('..')
  const range: { gte?: Date; lte?: Date } = {}
  if (fromStr) range.gte = new Date(fromStr + 'T00:00:00')
  if (toStr) range.lte = new Date(toStr + 'T23:59:59')

  return range.gte || range.lte ? range : null
}

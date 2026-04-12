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

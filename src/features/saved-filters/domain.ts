import type { SongColumnFilters } from '@/features/songs/domain'

export interface SavedFilter {
  id: number
  name: string
  filters: SongColumnFilters
  createdAt: string
}

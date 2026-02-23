import { SongSortField } from '@/features/songs/domain'

export type ConfigKey = 'columnVisibility'

export type ColumnVisibilityState = {
  [key in SongSortField]: boolean
}

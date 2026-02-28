import { SongSortField } from '@/features/songs/domain'

export type ConfigKey = 'columnVisibility' | 'dismissedVersion'

export type ColumnVisibilityState = {
  [key in SongSortField]: boolean
}

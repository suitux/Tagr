import { useCallback } from 'react'
import { DEFAULT_SORT_ORDER, SortOrderState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'
import type { ColumnField, SongSortDirection } from '@/features/songs/domain'

/**
 * Single source of truth for the list sort order. It is persisted globally per
 * user via the `sortOrder` config (independent of folder or playlist), the same
 * way column visibility is handled — the react-query cache is the state, no
 * separate store needed.
 */
export function useSortOrder() {
  const { data } = useConfig<SortOrderState>({
    key: 'sortOrder',
    parser: v => genericJsonObjectParser<SortOrderState>(v) ?? DEFAULT_SORT_ORDER,
    defaultData: DEFAULT_SORT_ORDER
  })

  const { mutate: updateConfig } = useUpdateConfig({
    parser: v => genericJsonObjectParser<SortOrderState>(v) ?? DEFAULT_SORT_ORDER
  })

  const sorting = data ?? DEFAULT_SORT_ORDER

  const setSorting = useCallback(
    (sortField: ColumnField, sort: SongSortDirection) => {
      updateConfig({ key: 'sortOrder', value: JSON.stringify({ sortField, sort }) })
    },
    [updateConfig]
  )

  const clearSorting = useCallback(() => {
    updateConfig({ key: 'sortOrder', value: JSON.stringify(DEFAULT_SORT_ORDER) })
  }, [updateConfig])

  return { sorting, setSorting, clearSorting }
}

import { useCallback } from 'react'
import { DEFAULT_SORT_ORDER, SortOrderState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'
import { RECENTLY_LISTENED_ONLY_FIELDS, type ColumnField, type SongSortDirection } from '@/features/songs/domain'
import { useListenSortStore } from '@/stores/listen-sort-store'

interface UseSortOrderOptions {
  /**
   * Whether the caller renders listen-only columns (the recently-played view). Only then is the
   * ephemeral `listenedAt` sort applied, so it can never leak into the folder or playlist views.
   */
  allowListenFields?: boolean
}

/**
 * Single source of truth for the list sort order. It is persisted globally per
 * user via the `sortOrder` config (independent of folder or playlist), the same
 * way column visibility is handled — the react-query cache is the state, no
 * separate store needed. The exception is sorting by a listen-only column, which
 * stays in memory (see `useListenSortStore`).
 */
export function useSortOrder({ allowListenFields = false }: UseSortOrderOptions = {}) {
  const { data } = useConfig<SortOrderState>({
    key: 'sortOrder',
    parser: v => genericJsonObjectParser<SortOrderState>(v) ?? DEFAULT_SORT_ORDER,
    defaultData: DEFAULT_SORT_ORDER
  })

  const { mutate: updateConfig } = useUpdateConfig({
    parser: v => genericJsonObjectParser<SortOrderState>(v) ?? DEFAULT_SORT_ORDER
  })

  const listenSorting = useListenSortStore(s => s.sorting)
  const setListenSorting = useListenSortStore(s => s.setSorting)
  const clearListenSorting = useListenSortStore(s => s.clearSorting)

  const sorting = (allowListenFields && listenSorting) || data || DEFAULT_SORT_ORDER

  const setSorting = useCallback(
    (sortField: ColumnField, sort: SongSortDirection) => {
      if (RECENTLY_LISTENED_ONLY_FIELDS.has(sortField)) {
        setListenSorting({ sortField, sort })
        return
      }
      clearListenSorting()
      updateConfig({ key: 'sortOrder', value: JSON.stringify({ sortField, sort }) })
    },
    [updateConfig, setListenSorting, clearListenSorting]
  )

  const clearSorting = useCallback(() => {
    clearListenSorting()
    updateConfig({ key: 'sortOrder', value: JSON.stringify(DEFAULT_SORT_ORDER) })
  }, [updateConfig, clearListenSorting])

  return { sorting, setSorting, clearSorting }
}

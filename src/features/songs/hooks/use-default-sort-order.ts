import { useCallback, useMemo } from 'react'
import { DEFAULT_SORT_PREFERENCE, toDefaultSortOrder, type DefaultSortOrderState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'

const parse = (value: string | null) => toDefaultSortOrder(genericJsonObjectParser(value))

/** The user's `defaultSortOrder` setting: how the list is ordered while no column header is sorted. */
export function useDefaultSortOrder() {
  const { data } = useConfig<DefaultSortOrderState>({
    key: 'defaultSortOrder',
    parser: parse,
    defaultData: DEFAULT_SORT_PREFERENCE
  })
  const { mutate, isPending } = useUpdateConfig({ parser: parse })

  // The layout prefetch seeds the cache with the raw stored JSON, so it is validated here as well
  const defaultSorting = useMemo(() => toDefaultSortOrder(data), [data])

  const setDefaultSorting = useCallback(
    (value: DefaultSortOrderState) => mutate({ key: 'defaultSortOrder', value: JSON.stringify(value) }),
    [mutate]
  )

  return { defaultSorting, setDefaultSorting, isPending }
}

import { useMemo } from 'react'
import { ColumnVisibilityState, DEFAULT_VISIBLE_COLUMNS } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { genericJsonObjectParser } from '@/features/config/parsers'
import type { ColumnField, Song } from '@/features/songs/domain'
import type { ColumnDef } from '@tanstack/react-table'

interface UseColumnVisibilityParams {
  columns: ColumnDef<Song>[]
}

const useColumnVisibility = ({ columns }: UseColumnVisibilityParams) => {
  const { data, ...rest } = useConfig({
    key: 'columnVisibility',
    parser: v => genericJsonObjectParser<ColumnVisibilityState>(v),
    defaultData: DEFAULT_VISIBLE_COLUMNS
  })

  const columnVisibility = useMemo(() => {
    if (!data) return data
    const result = { ...data }
    for (const col of columns) {
      const id = col.id
      if (id && !(id in result)) {
        result[id as ColumnField] = false
      }
    }
    return result
  }, [columns, data])

  return { data: columnVisibility, ...rest }
}

export default useColumnVisibility

import { DEFAULT_VISIBLE_COLUMNS } from '@/components/panels/main-content/components/columns/columns'
import { ColumnVisibilityState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { genericJsonObjectParser } from '@/features/config/parsers'

const useColumnVisibility = () => {
  return useConfig({
    key: 'columnVisibility',
    parser: v => genericJsonObjectParser<ColumnVisibilityState>(v),
    defaultData: DEFAULT_VISIBLE_COLUMNS
  })
}

export default useColumnVisibility

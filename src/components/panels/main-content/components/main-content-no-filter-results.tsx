'use client'

import { FilterXIcon, SearchXIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DEFAULT_VISIBLE_COLUMNS } from '@/components/panels/main-content/components/columns/columns'
import useColumnVisibility from '@/components/panels/main-content/components/columns/hooks/use-column-visibility'
import { Button } from '@/components/ui/button'
import { useHome } from '@/contexts/home-context'
import { ColumnVisibilityState } from '@/features/config/domain'
import { useConfig } from '@/features/config/hooks/use-config'
import { genericJsonObjectParser } from '@/features/config/parsers'

export function MainContentNoFilterResults() {
  const tFiles = useTranslations('files')
  const { clearColumnFilters, setSearch } = useHome()
  const { data: columnVisibility } = useColumnVisibility()

  const activeColumnCount = Object.values(columnVisibility || {}).filter(Boolean).length

  return (
    <tbody>
      <tr>
        <td colSpan={activeColumnCount}>
          <div className='flex flex-col items-center justify-center min-h-[300px] text-center p-8'>
            <div className='mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
              <SearchXIcon className='w-8 h-8 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground mb-4'>{tFiles('noFilterResults')}</p>
            <Button
              variant='outline'
              onClick={() => {
                clearColumnFilters()
                setSearch('')
              }}>
              <FilterXIcon className='h-4 w-4' />
              {tFiles('clearFilters')}
            </Button>
          </div>
        </td>
      </tr>
    </tbody>
  )
}

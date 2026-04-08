'use client'

import { FilterXIcon, SearchXIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useHomeStore } from '@/stores/home-store'

interface MainContentNoFilterResultsProps {
  activeColumnsCount: number
}

export function MainContentNoFilterResults({ activeColumnsCount }: MainContentNoFilterResultsProps) {
  const tFiles = useTranslations('files')
  const clearColumnFilters = useHomeStore(s => s.clearColumnFilters)
  const setSearch = useHomeStore(s => s.setSearch)

  return (
    <tbody>
      <tr>
        <td colSpan={activeColumnsCount}>
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

'use client'

import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHome } from '@/contexts/home-context'
import type { SongSortField } from '@/features/songs/domain'

export function BooleanFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const tFiles = useTranslations('files')

  return (
    <div onClick={e => e.stopPropagation()}>
      <Select
        value={columnFilters[field] ?? ''}
        onValueChange={value => setColumnFilter(field, value === 'all' ? '' : value)}>
        <SelectTrigger size='sm' className='h-6 w-full text-xs'>
          <SelectValue placeholder={tFiles('booleanFilterAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>{tFiles('booleanFilterAll')}</SelectItem>
          <SelectItem value='true'>{tFiles('booleanFilterYes')}</SelectItem>
          <SelectItem value='false'>{tFiles('booleanFilterNo')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

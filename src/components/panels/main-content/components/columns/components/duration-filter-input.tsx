'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useHomeStore } from '@/stores/home-store'
import { MULTI_VALUE_SEPARATOR, type SongSortField } from '@/features/songs/domain'
import { formatDuration } from '../../../utils'

interface DurationRange {
  label: string
  value: string // "min..max" or "min.." for open-ended
}

function generateDurationRanges(): DurationRange[] {
  const ranges: DurationRange[] = []
  const step = 30
  const max = 600 // 10 minutes

  for (let min = 0; min < max; min += step) {
    const maxVal = min + step
    ranges.push({
      label: `${formatDuration(min) || '0:00'} – ${formatDuration(maxVal)}`,
      value: `${min}..${maxVal}`
    })
  }

  ranges.push({
    label: `> ${formatDuration(max)}`,
    value: `${max}..`
  })

  return ranges
}

const DURATION_RANGES = generateDurationRanges()

export function DurationFilterInput({ field }: { field: SongSortField }) {
  const columnFilters = useHomeStore(s => s.columnFilters)
  const setColumnFilter = useHomeStore(s => s.setColumnFilter)
  const tFiles = useTranslations('files')

  const raw = columnFilters[field] ?? ''
  const selected = raw ? raw.split(MULTI_VALUE_SEPARATOR) : []

  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
    setColumnFilter(field, next.join(MULTI_VALUE_SEPARATOR))
  }

  const clearAll = () => setColumnFilter(field, '')

  const selectedLabels = selected
    .map(v => DURATION_RANGES.find(r => r.value === v)?.label)
    .filter(Boolean)

  const label = selectedLabels.length === 0 ? tFiles('selectFilterAll') : selectedLabels.join(', ')

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-6 w-full justify-between text-xs font-normal px-1.5'>
            <span className='truncate'>{label}</span>
            <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          className='min-w-(--radix-dropdown-menu-trigger-width) max-h-64 overflow-y-auto'>
          {selected.length > 0 && (
            <>
              <DropdownMenuItem onSelect={clearAll} className='text-xs text-muted-foreground'>
                {tFiles('selectFilterAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            {DURATION_RANGES.map(range => (
              <DropdownMenuCheckboxItem
                key={range.value}
                checked={selected.includes(range.value)}
                onCheckedChange={() => toggle(range.value)}
                className='text-xs'>
                {range.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

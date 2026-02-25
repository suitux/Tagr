import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import { DATE_SONG_FIELDS, type SongSortField } from '@/features/songs/domain'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import { DateFilterInput } from './date-filter-input'

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
  justify?: 'start' | 'center' | 'end'
  enableColumnFilter?: boolean
}

// Track which filter field was focused before a potential remount
let focusedFilterField: SongSortField | null = null

function ColumnFilterInput({ field }: { field: SongSortField }) {
  const { columnFilters, setColumnFilter } = useHome()
  const tFiles = useTranslations('files')
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (focusedFilterField === field) {
      inputRef.current?.focus()
    }
  })

  return (
    <Input
      ref={inputRef}
      className='h-6 text-xs px-1.5'
      placeholder={tFiles('filterPlaceholder')}
      debounceMs={300}
      value={columnFilters[field] ?? ''}
      onChange={e => setColumnFilter(field, e.target.value)}
      onClick={e => e.stopPropagation()}
      onFocus={() => {
        focusedFilterField = field
      }}
      onBlur={() => {
        requestAnimationFrame(() => {
          if (focusedFilterField === field) focusedFilterField = null
        })
      }}
    />
  )
}

export function SortableHeader<TData>({
  column,
  label,
  className,
  justify = 'start',
  enableColumnFilter = true
}: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()
  const field = column.id as SongSortField
  const isDateField = DATE_SONG_FIELDS.has(field)

  return (
    <div className='flex flex-col gap-1 py-1'>
      <Button
        variant='ghost'
        className={cn('w-full cursor-pointer', className, {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end'
        })}
        onClick={() => column.toggleSorting(sorted === 'asc')}>
        {label}
        {sorted === 'asc' ? (
          <ArrowUp className='ml-2 h-4 w-4' />
        ) : sorted === 'desc' ? (
          <ArrowDown className='ml-2 h-4 w-4' />
        ) : (
          <ArrowUpDown className='ml-2 h-4 w-4 text-muted-foreground/50' />
        )}
      </Button>
      {enableColumnFilter && (isDateField ? <DateFilterInput field={field} /> : <ColumnFilterInput field={field} />)}
    </div>
  )
}

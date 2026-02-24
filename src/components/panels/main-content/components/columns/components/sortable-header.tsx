import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import { DATE_SONG_FIELDS, type SongSortField } from '@/features/songs/domain'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
  justify?: 'start' | 'center' | 'end'
  enableColumnFilter?: boolean
}

export function SortableHeader<TData>({ column, label, className, justify = 'start', enableColumnFilter = true }: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()
  const { columnFilters, setColumnFilter } = useHome()
  const field = column.id as SongSortField
  const showFilter = enableColumnFilter && !DATE_SONG_FIELDS.has(field)

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
      {showFilter && (
        <Input
          className='h-6 text-xs px-1.5'
          placeholder='Filter...'
          debounceMs={300}
          value={columnFilters[field] ?? ''}
          onChange={e => setColumnFilter(field, e.target.value)}
          onClick={e => e.stopPropagation()}
        />
      )}
    </div>
  )
}

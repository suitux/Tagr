import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  BOOLEAN_SONG_FIELDS,
  type ColumnField,
  DATE_SONG_FIELDS,
  DURATION_SONG_FIELDS,
  SELECT_SONG_FIELDS,
  type SongSortField
} from '@/features/songs/domain'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import { BooleanFilterInput } from './boolean-filter-input'
import { DateFilterInput } from './date-filter-input'
import { DurationFilterInput } from './duration-filter-input'
import { SelectFilterInput } from './select-filter-input'
import { TagFilterInput } from './tag-filter-input'

/** At this width or below there is no room to type in a filter, so the column only keeps its sort button. */
export const FILTER_MIN_COLUMN_WIDTH = 55

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
  justify?: 'start' | 'center' | 'end'
  enableColumnFilter?: boolean
}

export function SortableHeader<TData>({
  column,
  label,
  className,
  justify = 'start',
  enableColumnFilter = true
}: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()
  const field = column.id as ColumnField
  const isDateField = DATE_SONG_FIELDS.has(field)
  const isDurationField = DURATION_SONG_FIELDS.has(field)
  const isBooleanField = BOOLEAN_SONG_FIELDS.has(field)
  const isSelectField = SELECT_SONG_FIELDS.has(field)
  const hasRoomForFilter = column.getSize() > FILTER_MIN_COLUMN_WIDTH

  // Too narrow for a filter: the freed row lets the title drop below the sort icon instead of fighting it for width.
  const stacked = enableColumnFilter && !hasRoomForFilter

  const sortIcon =
    sorted === 'asc' ? (
      <ArrowUp className={cn('h-4 w-4', !stacked && 'ml-2')} />
    ) : sorted === 'desc' ? (
      <ArrowDown className={cn('h-4 w-4', !stacked && 'ml-2')} />
    ) : (
      <ArrowUpDown className={cn('h-4 w-4 text-muted-foreground/50', !stacked && 'ml-2')} />
    )

  return (
    <div className='flex flex-col gap-1 py-1'>
      <Button
        variant='ghost'
        className={cn('w-full cursor-pointer', className, {
          'justify-start': !stacked && justify === 'start',
          'justify-center': !stacked && justify === 'center',
          'justify-end': !stacked && justify === 'end',
          'h-auto flex-col gap-1 px-0 py-1': stacked
        })}
        onClick={() => column.toggleSorting(sorted === 'asc')}>
        {stacked ? (
          <>
            {sortIcon}
            <span className='max-w-full truncate'>{label}</span>
          </>
        ) : (
          <>
            {label}
            {sortIcon}
          </>
        )}
      </Button>
      {enableColumnFilter &&
        hasRoomForFilter &&
        (isDateField ? (
          <DateFilterInput field={field as SongSortField} />
        ) : isDurationField ? (
          <DurationFilterInput field={field as SongSortField} />
        ) : isBooleanField ? (
          <BooleanFilterInput field={field as SongSortField} />
        ) : isSelectField ? (
          <SelectFilterInput field={field as SongSortField} />
        ) : (
          <TagFilterInput field={field} />
        ))}
    </div>
  )
}

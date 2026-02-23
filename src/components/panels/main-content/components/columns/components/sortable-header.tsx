import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
  justify?: 'start' | 'center' | 'end'
}

export function SortableHeader<TData>({ column, label, className, justify = 'start' }: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()

  return (
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
  )
}

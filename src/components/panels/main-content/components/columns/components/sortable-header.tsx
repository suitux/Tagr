import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
}

export function SortableHeader<TData>({ column, label, className }: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant='ghost'
      className={cn('w-full justify-end', className)}
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

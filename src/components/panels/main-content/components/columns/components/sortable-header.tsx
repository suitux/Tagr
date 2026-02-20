import type { Column } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
}

export function SortableHeader<TData>({ column, label, className }: SortableHeaderProps<TData>) {
  return (
    <Button
      variant='ghost'
      className={cn('w-full justify-end', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </Button>
  )
}

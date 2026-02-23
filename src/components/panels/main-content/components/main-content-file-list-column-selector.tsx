'use client'

import { ColumnsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

interface ColumnSelectorProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (visibility: VisibilityState) => void
}

export function ColumnSelector<TData>({
  columns,
  columnVisibility,
  onColumnVisibilityChange
}: ColumnSelectorProps<TData>) {
  const tColumns = useTranslations('columns')
  const hideableColumns = columns.filter(col => col.enableHiding !== false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='gap-1.5'>
          <ColumnsIcon className='w-4 h-4' />
          {tColumns('toggleColumns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56 max-h-80 overflow-y-auto'>
        <DropdownMenuLabel>{tColumns('toggleColumns')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map(col => {
          const id = col.id ?? (col as { accessorKey?: string }).accessorKey ?? ''
          return (
            <DropdownMenuCheckboxItem
              key={id}
              checked={columnVisibility[id] !== false}
              onCheckedChange={value => onColumnVisibilityChange({ ...columnVisibility, [id]: !!value })}
              onSelect={e => e.preventDefault()}>
              {id}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

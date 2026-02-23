'use client'

import { ColumnsIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ColumnVisibilityState } from '@/features/config/domain'
import { SongSortField } from '@/features/songs/domain'
import type { ColumnDef } from '@tanstack/react-table'

interface ColumnSelectorProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  columnVisibility: ColumnVisibilityState
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void
}

function ColumnSelector<TData>({ columns, columnVisibility, onColumnVisibilityChange }: ColumnSelectorProps<TData>) {
  const tColumns = useTranslations('columns')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')

  const hideableColumns = columns.filter(col => col.enableHiding !== false)

  const filteredColumns = useMemo(() => {
    if (!search) return hideableColumns
    const query = search.toLowerCase()

    return hideableColumns.filter(col => {
      const id = col.id ?? (col as { accessorKey?: string }).accessorKey ?? ''
      return id.toLowerCase().includes(query)
    })
  }, [hideableColumns, search])

  return (
    <DropdownMenu onOpenChange={open => !open && setSearch('')}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='gap-1.5'>
          <ColumnsIcon className='w-4 h-4' />
          {tColumns('toggleColumns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>{tColumns('toggleColumns')}</DropdownMenuLabel>
        <div className='px-1.5 py-1'>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className='w-3.5 h-3.5' />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
              placeholder={tCommon('search')}
            />
          </InputGroup>
        </div>
        <DropdownMenuSeparator />
        <div className='max-h-64 overflow-y-auto'>
          {filteredColumns.map(col => {
            const id = col.id as SongSortField
            return (
              <DropdownMenuCheckboxItem
                key={id}
                checked={columnVisibility?.[id]}
                onCheckedChange={value => onColumnVisibilityChange({ ...columnVisibility, [id]: value })}
                onSelect={e => e.preventDefault()}>
                {id}
              </DropdownMenuCheckboxItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColumnSelector

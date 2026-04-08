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
import { ColumnField, getMetadataKeyFromColumnId, isMetadataColumnId } from '@/features/songs/domain'
import type { ColumnDef } from '@tanstack/react-table'

interface ColumnSelectorProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  columnVisibility: ColumnVisibilityState
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void
}

function ColumnSelector<TData>({ columns, columnVisibility, onColumnVisibilityChange }: ColumnSelectorProps<TData>) {
  const tColumns = useTranslations('columns')
  const tCommon = useTranslations('common')
  const t = useTranslations('fields')
  const [search, setSearch] = useState('')

  const hideableColumns = columns.filter(col => col.enableHiding !== false)

  const { standardColumns, metadataColumns } = useMemo(() => {
    const standard: typeof hideableColumns = []
    const metadata: typeof hideableColumns = []
    for (const col of hideableColumns) {
      const id = col.id ?? (col as { accessorKey?: string }).accessorKey ?? ''
      if (isMetadataColumnId(id)) {
        metadata.push(col)
      } else {
        standard.push(col)
      }
    }
    return { standardColumns: standard, metadataColumns: metadata }
  }, [hideableColumns])

  const filteredStandard = useMemo(() => {
    if (!search) return standardColumns
    const query = search.toLowerCase()
    return standardColumns.filter(col => {
      const id = col.id ?? (col as { accessorKey?: string }).accessorKey ?? ''
      const label = t(id as Parameters<typeof t>[0])
      return label.toLowerCase().includes(query) || id.toLowerCase().includes(query)
    })
  }, [standardColumns, search, t])

  const filteredMetadata = useMemo(() => {
    if (!search) return metadataColumns
    const query = search.toLowerCase()
    return metadataColumns.filter(col => {
      const id = col.id ?? ''
      const label = isMetadataColumnId(id) ? getMetadataKeyFromColumnId(id) : id
      return label.toLowerCase().includes(query) || id.toLowerCase().includes(query)
    })
  }, [metadataColumns, search])

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
          {filteredStandard.length > 0 && (
            <>
              <DropdownMenuLabel className='text-xs text-muted-foreground'>{tColumns('genericTags')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredStandard.map(col => {
                const id = col.id as ColumnField
                return (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={columnVisibility?.[id]}
                    onCheckedChange={value => onColumnVisibilityChange({ ...columnVisibility, [id]: value })}
                    onSelect={e => e.preventDefault()}>
                    {t(id as Parameters<typeof t>[0])}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </>
          )}
          {filteredMetadata.length > 0 && (
            <>
              <DropdownMenuLabel className='text-xs text-muted-foreground'>{tColumns('customTags')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredMetadata.map(col => {
                const id = col.id as ColumnField
                return (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={columnVisibility?.[id]}
                    onCheckedChange={value => onColumnVisibilityChange({ ...columnVisibility, [id]: value })}
                    onSelect={e => e.preventDefault()}>
                    {getMetadataKeyFromColumnId(id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColumnSelector

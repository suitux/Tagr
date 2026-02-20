'use client'

import { useCallback, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  selectedRowId?: string | null
  getRowId?: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onScrollEnd?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  selectedRowId,
  getRowId,
  sorting,
  onSortingChange,
  onScrollEnd
}: DataTableProps<TData, TValue>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange,
    getRowId,
    state: { sorting: sorting ?? [] }
  })

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !onScrollEnd) return
    const threshold = 200
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      onScrollEnd()
    }
  }, [onScrollEnd])

  return (
    <Table rootProps={{ ref: scrollRef, onScroll: handleScroll }}>
      <TableHeader className='sticky top-0 z-10 bg-background'>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow
            key={row.id}
            data-state={row.id === selectedRowId ? 'selected' : undefined}
            className={cn('cursor-pointer', row.id === selectedRowId && 'bg-accent')}
            onClick={() => onRowClick?.(row.original)}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

'use client'

import { useCallback, useRef } from 'react'
import { type TableComponents, type TableVirtuosoHandle, TableVirtuoso } from 'react-virtuoso'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  type OnChangeFn,
  type Row,
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

interface VirtuosoContext<TData> {
  rows: Row<TData>[]
  selectedRowId?: string | null
  onRowClick?: (row: TData) => void
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
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: params => {
      onSortingChange?.(params)
      virtuosoRef.current?.scrollToIndex({ index: 0 })
    },
    getRowId,
    state: { sorting: sorting ?? [] }
  })

  const { rows } = table.getRowModel()

  const fixedHeaderContent = useCallback(
    () =>
      table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <TableHead
              key={header.id}
              className='bg-background'
              style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      )),
    [table]
  )

  const components: TableComponents<unknown, VirtuosoContext<TData>> = {
    Table: ({ style, ...props }) => (
      <Table {...props} className='w-full caption-bottom text-sm' style={{ ...style, tableLayout: 'fixed' }} />
    ),
    TableBody: ({ style, ...props }) => <TableBody {...props} style={style} className='[&_tr:last-child]:border-0' />,
    TableRow: ({ context, ...props }) => {
      const index = props['data-item-index']
      const row = context?.rows[index]

      return (
        <TableRow
          {...props}
          data-state={row.id === context?.selectedRowId ? 'selected' : undefined}
          className={cn('cursor-pointer', row.id === context?.selectedRowId && 'bg-accent')}
          onClick={() => context?.onRowClick?.(row.original)}
        />
      )
    }
  }

  return (
    <TableVirtuoso
      ref={virtuosoRef}
      totalCount={rows.length}
      overscan={200}
      endReached={onScrollEnd}
      increaseViewportBy={200}
      fixedHeaderContent={fixedHeaderContent}
      context={{ rows, selectedRowId, onRowClick }}
      itemContent={(index, _data, context) => {
        const row = context.rows[index]
        if (!row) return null
        return row
          .getVisibleCells()
          .map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)
      }}
      components={components}
    />
  )
}

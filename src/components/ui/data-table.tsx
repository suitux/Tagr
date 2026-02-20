'use client'

import { useCallback } from 'react'
import { type TableComponents, TableVirtuoso } from 'react-virtuoso'
import { TableCell, TableRow } from '@/components/ui/table'
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
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange,
    getRowId,
    state: { sorting: sorting ?? [] }
  })

  const { rows } = table.getRowModel()

  const fixedHeaderContent = useCallback(
    () =>
      table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} className='border-b'>
          {headerGroup.headers.map(header => (
            <th
              key={header.id}
              className='text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap bg-background'
              style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      )),
    [table]
  )

  const components: TableComponents<unknown, VirtuosoContext<TData>> = {
    Table: ({ style, ...props }) => (
      <table {...props} className='w-full caption-bottom text-sm' style={{ ...style, tableLayout: 'fixed' }} />
    ),
    TableBody: ({ style, ...props }) => <tbody {...props} style={style} className='[&_tr:last-child]:border-0' />,
    TableRow: ({ context, item, ...props }) => {
      const index = item as number
      const row = context?.rows[index]
      if (!row) return <tr {...props} />
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

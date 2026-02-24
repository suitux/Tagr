'use client'

import { type ComponentType, useCallback, useMemo, useRef, useState } from 'react'
import { type TableComponents, type TableVirtuosoHandle, TableVirtuoso } from 'react-virtuoso'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  selectedRowId?: string | null
  getRowId?: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onScrollEnd?: () => void
  EmptyStateComponent?: ComponentType
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
  columnVisibility,
  onColumnVisibilityChange,
  onScrollEnd,
  EmptyStateComponent
}: DataTableProps<TData, TValue>) {
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    columnResizeMode,
    onSortingChange: params => {
      onSortingChange?.(params)
      virtuosoRef.current?.scrollToIndex({ index: 0 })
    },
    getRowId,
    onColumnVisibilityChange,
    state: {
      sorting: sorting ?? [],
      columnVisibility: columnVisibility ?? {}
    }
  })

  const { rows } = table.getRowModel()

  const fixedHeaderContent = useCallback(
    () =>
      table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <TableHead className='relative' key={header.id} style={{ width: header.getSize() }}>
              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              <div
                className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-10 hover:opacity-100 ${
                  header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
                }`}
                role='button'
                tabIndex={0}
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
              />
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

  const showEmptyState = rows.length === 0 && !!EmptyStateComponent

  return (
    <div className='flex flex-col h-full'>
      <TableVirtuoso
        ref={virtuosoRef}
        totalCount={rows.length}
        overscan={200}
        endReached={onScrollEnd}
        increaseViewportBy={200}
        fixedHeaderContent={fixedHeaderContent}
        context={{ rows, selectedRowId, onRowClick }}
        className={showEmptyState ? 'flex-none' : 'flex-1'}
        itemContent={(index, _data, context) => {
          const row = context.rows[index]
          if (!row) return null
          return row
            .getVisibleCells()
            .map(cell => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))
        }}
        components={components}
      />
      {showEmptyState && <EmptyStateComponent />}
    </div>
  )
}

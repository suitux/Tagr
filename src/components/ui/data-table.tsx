'use client'

import {
  DndContext,
  type DraggableAttributes,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ComponentType, ReactNode, createContext, useCallback, useRef, useState } from 'react'
import { type TableComponents, TableVirtuoso, type TableVirtuosoHandle } from 'react-virtuoso'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  selectedRowId?: string | null
  getRowId?: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnVisibility?: VisibilityState | null
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onScrollEnd?: () => void
  EmptyStateComponent?: () => ReactNode
  RowWrapper?: ComponentType<{ row: TData; children: ReactNode }>
  /** Enables drag-to-reorder of rows. Row ids come from getRowId. */
  enableRowReorder?: boolean
  /** Called with the full ordered list of row ids after a drag. */
  onRowReorder?: (orderedRowIds: string[]) => void
}

interface VirtuosoContext<TData> {
  rows: Row<TData>[]
  selectedRowId?: string | null
  onRowClick?: (row: TData) => void
  RowWrapper?: ComponentType<{ row: TData; children: ReactNode }>
  enableRowReorder?: boolean
}

/**
 * Drag listeners/attributes for the current row, provided to descendant cells so a
 * dedicated drag-handle cell can be the only draggable surface (keeps row click / context menu working).
 */
export interface RowDragHandle {
  attributes: DraggableAttributes
  listeners: Record<string, (event: unknown) => void> | undefined
}

export const RowDragHandleContext = createContext<RowDragHandle | null>(null)

/** A virtuoso table row that is sortable via dnd-kit. Drag only fires from a handle cell, not the whole row. */
function SortableVirtuosoRow({
  id,
  selected,
  onClick,
  rowProps
}: {
  id: string
  selected: boolean
  onClick: () => void
  rowProps: Record<string, unknown>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <RowDragHandleContext.Provider value={{ attributes, listeners: listeners as RowDragHandle['listeners'] }}>
      <TableRow
        {...rowProps}
        ref={setNodeRef}
        style={{ ...(rowProps.style as object), transform: CSS.Transform.toString(transform), transition }}
        data-state={selected ? 'selected' : undefined}
        className={cn('cursor-pointer group', selected && 'bg-accent', isDragging && 'relative z-10 opacity-80')}
        onClick={onClick}
      />
    </RowDragHandleContext.Provider>
  )
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
  EmptyStateComponent,
  RowWrapper,
  enableRowReorder,
  onRowReorder
}: DataTableProps<TData, TValue>) {
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const reorderSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

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
            <TableHead className='relative pb-0.5' key={header.id} style={{ width: header.getSize() }}>
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
      const Wrapper = context?.RowWrapper
      const selected = row?.id === context?.selectedRowId

      const tableRow =
        context?.enableRowReorder && row ? (
          <SortableVirtuosoRow
            id={row.id}
            selected={selected}
            onClick={() => context?.onRowClick?.(row.original)}
            rowProps={props}
          />
        ) : (
          <TableRow
            {...props}
            data-state={selected ? 'selected' : undefined}
            className={cn('cursor-pointer group', selected && 'bg-accent')}
            onClick={() => context?.onRowClick?.(row.original)}
          />
        )

      if (Wrapper && row) {
        return <Wrapper row={row.original}>{tableRow}</Wrapper>
      }
      return tableRow
    },
    EmptyPlaceholder: EmptyStateComponent ? () => <EmptyStateComponent /> : undefined
  }

  const showEmptyState = rows.length === 0 && !!EmptyStateComponent

  const handleReorderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = rows.map(r => r.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onRowReorder?.(arrayMove(ids, oldIndex, newIndex))
  }

  const virtuoso = (
    <TableVirtuoso
      ref={virtuosoRef}
      totalCount={rows.length}
      overscan={200}
      endReached={onScrollEnd}
      increaseViewportBy={200}
      fixedHeaderContent={fixedHeaderContent}
      context={{ rows, selectedRowId, onRowClick, RowWrapper, enableRowReorder }}
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
  )

  return (
    <div className='flex flex-col h-full'>
      {enableRowReorder ? (
        <DndContext sensors={reorderSensors} collisionDetection={closestCenter} onDragEnd={handleReorderDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            {virtuoso}
          </SortableContext>
        </DndContext>
      ) : (
        virtuoso
      )}
    </div>
  )
}

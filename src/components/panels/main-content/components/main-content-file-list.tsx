'use client'

import { useCallback, useMemo, useState } from 'react'
import { ColumnsIcon, LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useHome } from '@/contexts/home-context'
import type { Song, SongSortField } from '@/features/songs/domain'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import { useSongColumns, DEFAULT_VISIBLE_COLUMNS } from './columns/columns'
import { MainContentEmptyFilesState } from './main-content-empty-files-state'

export function MainContentFileList() {
  const {
    selectedSongId,
    songs,
    setSelectedSongId,
    isLoadingSongs,
    sorting,
    setSorting,
    clearSorting,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useHome()
  const columns = useSongColumns()
  const tColumns = useTranslations('columns')

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    // All columns hidden by default, except the ones in DEFAULT_VISIBLE_COLUMNS
    const visibility: VisibilityState = {}
    for (const col of columns) {
      const id = col.id ?? (col as { accessorKey?: string }).accessorKey
      if (id) {
        visibility[id] = DEFAULT_VISIBLE_COLUMNS[id] ?? false
      }
    }
    return visibility
  })

  const tableSorting: SortingState = useMemo(
    () => (sorting.sortField ? [{ id: sorting.sortField, desc: sorting.sort === 'desc' }] : []),
    [sorting]
  )

  const onSortingChange = useCallback(
    (updaterOrValue: SortingState | ((prev: SortingState) => SortingState)) => {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(tableSorting) : updaterOrValue
      if (newSorting.length === 0) {
        clearSorting()
      } else {
        const { id, desc } = newSorting[0]
        setSorting(id as SongSortField, desc ? 'desc' : 'asc')
      }
    },
    [tableSorting, setSorting, clearSorting]
  )

  const handleScrollEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (songs.length === 0 && !isLoadingSongs) {
    return <MainContentEmptyFilesState />
  }

  const hideableColumns = columns.filter(col => col.enableHiding !== false)

  return (
    <div className='pt-4 px-4 flex flex-col overflow-hidden flex-1'>
      <div className='flex justify-end mb-2'>
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
                  onCheckedChange={value => setColumnVisibility(prev => ({ ...prev, [id]: !!value }))}
                  onSelect={e => e.preventDefault()}>
                  {id}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable
        columns={columns}
        data={songs}
        getRowId={(song: Song) => String(song.id)}
        selectedRowId={selectedSongId != null ? String(selectedSongId) : null}
        onRowClick={(song: Song) => setSelectedSongId?.(song.id)}
        sorting={tableSorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onScrollEnd={handleScrollEnd}
      />
      {isFetchingNextPage && (
        <div className='flex items-center justify-center py-3'>
          <LoaderCircle className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      )}
    </div>
  )
}

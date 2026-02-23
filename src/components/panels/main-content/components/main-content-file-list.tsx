'use client'

import { useCallback, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { useHome } from '@/contexts/home-context'
import type { Song, SongSortField } from '@/features/songs/domain'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import { useSongColumns, DEFAULT_VISIBLE_COLUMNS } from './columns/columns'
import { ColumnSelector } from './main-content-file-list-column-selector'
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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
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

  return (
    <div className='pt-4 px-4 flex flex-col overflow-hidden flex-1'>
      <div className='flex justify-end mb-2'>
        <ColumnSelector
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
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

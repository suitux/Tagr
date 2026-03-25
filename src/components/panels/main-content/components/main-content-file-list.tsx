'use client'

import { LoaderCircle } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import useColumnVisibility from '@/components/panels/main-content/components/columns/hooks/use-column-visibility'
import { DataTable } from '@/components/ui/data-table'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { genericJsonObjectParser } from '@/features/config/parsers'
import type { Song, SongSortField } from '@/features/songs/domain'
import { useSongsList } from '@/features/songs/hooks/use-songs-list'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useHomeStore } from '@/stores/home-store'
import type { SortingState, VisibilityState } from '@tanstack/react-table'
import { useSongColumns } from './columns/columns'
import { MainContentEmptyFilesState } from './main-content-empty-files-state'
import ColumnSelector from './main-content-file-list-column-selector'
import { MainContentNoFilterResults } from './main-content-no-filter-results'
import { SavedFiltersDropdown } from './saved-filters-dropdown'

export function MainContentFileList() {
  const { selectedSongId, setSelectedSongId } = useSelectedSong()
  const { songs, isLoadingSongs, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsList()
  const sorting = useHomeStore(s => s.sorting)
  const setSorting = useHomeStore(s => s.setSorting)
  const clearSorting = useHomeStore(s => s.clearSorting)
  const columnFilters = useHomeStore(s => s.columnFilters)
  const search = useHomeStore(s => s.search)
  const isAnyFilterActive = Object.values(columnFilters).some(value => value) || search.length > 0
  const columns = useSongColumns()

  const { data: columnVisibility } = useColumnVisibility()
  const { mutate: updateConfig } = useUpdateConfig({ parser: genericJsonObjectParser })

  const setColumnVisibility = (value: VisibilityState) => {
    updateConfig({ key: 'columnVisibility', value: JSON.stringify(value) })
  }

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

  if (songs.length === 0 && !isLoadingSongs && !isAnyFilterActive) {
    return <MainContentEmptyFilesState />
  }

  return (
    <div className='pt-4 px-2 md:px-4 flex flex-col overflow-hidden flex-1'>
      <div className='flex justify-end gap-2 mb-2'>
        <SavedFiltersDropdown />
        <ColumnSelector
          columns={columns}
          columnVisibility={columnVisibility!}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>
      <DataTable
        columns={columns}
        data={songs}
        getRowId={(song: Song) => String(song.id)}
        selectedRowId={selectedSongId != null ? String(selectedSongId) : null}
        onRowClick={(song: Song) => {
          setSelectedSongId?.(song.id)
        }}
        sorting={tableSorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={value => {
          setColumnVisibility(value as VisibilityState)
        }}
        onScrollEnd={handleScrollEnd}
        EmptyStateComponent={MainContentNoFilterResults}
      />
      {isFetchingNextPage && (
        <div className='flex items-center justify-center py-3'>
          <LoaderCircle className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      )}
    </div>
  )
}

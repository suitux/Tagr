'use client'

import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useHomeStore } from '@/stores/home-store'
import { useSongsByFolder } from './use-songs-by-folder'

interface UseSongsListParams {
  metadataKeys?: string[]
}

export function useSongsList(params?: UseSongsListParams) {
  const { selectedFolderId } = useSelectedFolder()
  const search = useHomeStore(s => s.search)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined

  const { data, isLoading, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsByFolder({
    folderPath: selectedFolderId,
    search,
    sorting,
    filters: activeFilters,
    metadataKeys: params?.metadataKeys
  })

  const songs = data?.pages.flatMap(page => (page.success ? page.files : [])) ?? []
  const totalSongs = (data?.pages[0]?.success === true && data?.pages[0]?.totalFiles) || null

  return {
    songs,
    totalSongs,
    isLoadingSongs: isLoading,
    isRefetching: isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  }
}

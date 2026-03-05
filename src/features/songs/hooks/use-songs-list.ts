'use client'

import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useHomeStore } from '@/stores/home-store'
import { useSongsByFolder } from './use-songs-by-folder'

export function useSongsList() {
  const { selectedFolderId } = useSelectedFolder()
  const search = useHomeStore(s => s.search)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsByFolder(
    selectedFolderId ?? undefined,
    search || undefined,
    sorting,
    activeFilters
  )

  const songs = data?.pages.flatMap(page => (page.success ? page.files : [])) ?? []
  const totalSongs = (data?.pages[0]?.success === true && data?.pages[0]?.totalFiles) || null

  return {
    songs,
    totalSongs,
    isLoadingSongs: isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  }
}

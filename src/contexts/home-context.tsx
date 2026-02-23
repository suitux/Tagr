'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Song, SongSortDirection, SongSortField } from '@/features/songs/domain'
import { useSongsByFolder, type SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'

interface HomeContextValue {
  selectedFolderId: string | null
  selectedSongId: number | null
  songs: Song[]
  totalSongs: number | null
  isLoadingSongs: boolean
  search: string
  sorting: SongsSortParams
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  setSearch: (value: string) => void
  setSelectedFolderId: (folderId: string | null) => void
  setSelectedSongId: (songId: number | null) => void
  setSorting: (sortField: SongSortField, sort: SongSortDirection) => void
  clearSorting: () => void
}

const HomeContext = createContext<HomeContextValue | null>(null)

interface HomeProviderProps {
  children: ReactNode
  selectedFolderId: string | null
  selectedSongId: number | null
  onFolderSelect: (folderId: string | null) => void
  onSongSelect: (songId: number | null) => void
}

export function HomeProvider({
  children,
  selectedFolderId,
  selectedSongId,
  onFolderSelect,
  onSongSelect
}: HomeProviderProps) {
  const [search, setSearch] = useState('')
  const [sorting, setSortingState] = useState<SongsSortParams>({})

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsByFolder(
    selectedFolderId ?? undefined,
    search || undefined,
    sorting
  )

  const songs = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap(page => (page.success ? page.files : []))
  }, [data])

  const setSorting = (sortField: SongSortField, sort: SongSortDirection) => {
    setSortingState({ sortField, sort })
  }

  const clearSorting = () => {
    setSortingState({})
  }

  return (
    <HomeContext.Provider
      value={{
        selectedFolderId,
        selectedSongId,
        songs,
        totalSongs: (data?.pages[0].success === true && data?.pages[0].totalFiles) || null,
        isLoadingSongs: isLoading,
        search,
        sorting,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        setSearch,
        setSelectedFolderId: onFolderSelect,
        setSelectedSongId: onSongSelect,
        setSorting,
        clearSorting
      }}>
      {children}
    </HomeContext.Provider>
  )
}

export function useHome() {
  const context = useContext(HomeContext)
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider')
  }
  return context
}

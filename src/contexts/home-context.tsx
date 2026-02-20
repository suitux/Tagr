'use client'

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react'
import type { Song } from '@/features/songs/domain'
import { useSongsByFolder, type SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'

interface HomeContextValue {
  selectedFolderId: string | null
  selectedSongId: number | null
  songs: Song[]
  isLoadingSongs: boolean
  search: string
  setSearch: (value: string) => void
  setSelectedFolderId: (folderId: string | null) => void
  setSelectedSongId: (songId: number | null) => void
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

  const { data, isLoading } = useSongsByFolder(selectedFolderId ?? undefined, search || undefined)
  const songs = data?.success ? data.files : []

  return (
    <HomeContext.Provider
      value={{
        selectedFolderId,
        selectedSongId,
        songs,
        isLoadingSongs: isLoading,
        search,
        setSearch,
        setSelectedFolderId: onFolderSelect,
        setSelectedSongId: onSongSelect
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

'use client'

import { useState } from 'react'
import { useSongsByFolder } from '@/features/songs/hooks/use-songs-by-folder'
import { MainContentEmptyFilesState } from './components/main-content-empty-files-state'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileList } from './components/main-content-file-list'
import { MainContentHeader } from './components/main-content-header'

interface MainContentProps {
  selectedFolderId?: string | null
  onSongSelect?: (songId: number | null) => void
  selectedSongId?: number | null
}

export function MainContent({ selectedFolderId, onSongSelect, selectedSongId }: MainContentProps) {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useSongsByFolder(selectedFolderId ?? undefined, search || undefined)

  if (!selectedFolderId) {
    return <MainContentEmptyFolderState />
  }

  const songs = data?.success ? data.files : []
  const folderName = selectedFolderId.split('/').pop() || selectedFolderId

  return (
    <div className='flex flex-col h-full'>
      <MainContentHeader
        folderName={folderName}
        folderPath={selectedFolderId}
        filesCount={songs.length}
        onSearchChange={setSearch}
      />

      {songs.length === 0 && !isLoading ? (
        <MainContentEmptyFilesState />
      ) : (
        <MainContentFileList songs={songs} selectedSongId={selectedSongId} onSongSelect={onSongSelect} />
      )}
    </div>
  )
}

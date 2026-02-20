'use client'

import type { Song } from '@/features/songs/domain'
import { useSongsByFolder } from '@/features/songs/hooks/use-songs-by-folder'
import { MainContentEmptyFilesState } from './components/main-content-empty-files-state'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileList } from './components/main-content-file-list'
import { MainContentHeader } from './components/main-content-header'
import { MainContentLoadingState } from './components/main-content-loading-state'

interface MainContentProps {
  selectedFolderId?: string | null
  onFileSelect?: (file: Song | null) => void
  selectedFile?: Song | null
}

export function MainContent({ selectedFolderId, onFileSelect, selectedFile }: MainContentProps) {
  const { data, isLoading } = useSongsByFolder(selectedFolderId ?? undefined)

  if (!selectedFolderId) {
    return <MainContentEmptyFolderState />
  }

  if (isLoading) {
    return <MainContentLoadingState />
  }

  const songs = data?.success ? data.files : []
  const folderName = selectedFolderId.split('/').pop() || selectedFolderId

  return (
    <div className='flex flex-col h-full'>
      <MainContentHeader folderName={folderName} folderPath={selectedFolderId} filesCount={songs.length} />

      {songs.length === 0 ? (
        <MainContentEmptyFilesState />
      ) : (
        <MainContentFileList songs={songs} selectedFile={selectedFile} onFileSelect={onFileSelect} />
      )}
    </div>
  )
}

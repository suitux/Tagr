'use client'

import type { Song } from '@/features/songs/domain'
import { useSongsByFolder } from '@/features/songs/hooks/use-songs-by-folder'
import { ContentHeader } from './components/content-header'
import { EmptyFilesState } from './components/empty-files-state'
import { EmptyFolderState } from './components/empty-folder-state'
import { FileList } from './components/file-list'
import { LoadingState } from './components/loading-state'

interface MainContentProps {
  selectedFolderId?: string | null
  onFileSelect?: (file: Song | null) => void
  selectedFile?: Song | null
}

export function MainContent({ selectedFolderId, onFileSelect, selectedFile }: MainContentProps) {
  const { data, isLoading } = useSongsByFolder(selectedFolderId ?? undefined)

  if (!selectedFolderId) {
    return <EmptyFolderState />
  }

  if (isLoading) {
    return <LoadingState />
  }

  const songs = data?.success ? data.files : []
  const folderName = selectedFolderId.split('/').pop() || selectedFolderId

  return (
    <div className='flex flex-col h-full'>
      <ContentHeader folderName={folderName} folderPath={selectedFolderId} filesCount={songs.length} />

      {songs.length === 0 ? (
        <EmptyFilesState />
      ) : (
        <FileList songs={songs} selectedFile={selectedFile} onFileSelect={onFileSelect} />
      )}
    </div>
  )
}

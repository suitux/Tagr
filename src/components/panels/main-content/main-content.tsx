'use client'

import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileList } from './components/main-content-file-list'
import { MainContentHeader } from './components/main-content-header'
import { MainContentSmartPlaylistView } from './components/main-content-smart-playlist-view'

export function MainContent() {
  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()

  if (selectedPlaylistId !== null) {
    return <MainContentSmartPlaylistView playlistId={selectedPlaylistId} />
  }

  if (!selectedFolderId) {
    return <MainContentEmptyFolderState />
  }

  return (
    <div className='flex flex-col h-full'>
      <MainContentHeader />
      <MainContentFileList />
    </div>
  )
}

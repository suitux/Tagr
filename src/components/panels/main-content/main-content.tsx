'use client'

import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileListView } from './components/main-content-file-list-view'
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

  return <MainContentFileListView />
}

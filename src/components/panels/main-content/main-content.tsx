'use client'

import { useSelectedCustomPlaylist } from '@/hooks/use-selected-custom-playlist'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { MainContentCustomPlaylistView } from './components/main-content-custom-playlist-view'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileListView } from './components/main-content-file-list-view'
import { MainContentSmartPlaylistView } from './components/main-content-smart-playlist-view'

export function MainContent() {
  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const { selectedCustomPlaylistId } = useSelectedCustomPlaylist()

  if (selectedCustomPlaylistId !== null) {
    return <MainContentCustomPlaylistView playlistId={selectedCustomPlaylistId} />
  }

  if (selectedPlaylistId !== null) {
    return <MainContentSmartPlaylistView playlistId={selectedPlaylistId} />
  }

  if (!selectedFolderId) {
    return <MainContentEmptyFolderState />
  }

  return <MainContentFileListView />
}

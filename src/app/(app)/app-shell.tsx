'use client'

import { BulkSummaryModal } from '@/components/bulk-summary-modal'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { ScanSummaryModal } from '@/components/scan-summary-modal'
import { StarPromptDialog } from '@/components/star-prompt-dialog'
import { useSelectedCustomPlaylist } from '@/hooks/use-selected-custom-playlist'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { selectedFolderId, setSelectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId, setSelectedPlaylistId } = useSelectedPlaylist()
  const { selectedCustomPlaylistId, setSelectedCustomPlaylistId } = useSelectedCustomPlaylist()
  const { selectedSongId } = useSelectedSong()
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)
  const clearBulkSelect = useBulkSelectionStore(s => s.clear)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setFolderSheetOpen(false)
    clearBulkSelect()
  }

  const handlePlaylistSelect = (playlistId: number | null) => {
    setSelectedPlaylistId(playlistId)
    setFolderSheetOpen(false)
    clearBulkSelect()
  }

  const handleCustomPlaylistSelect = (playlistId: number | null) => {
    setSelectedCustomPlaylistId(playlistId)
    setFolderSheetOpen(false)
    clearBulkSelect()
  }

  return (
    <>
      <ScanSummaryModal />
      <BulkSummaryModal />
      <StarPromptDialog />
      <ResponsiveLayout
        sidebar={
          <FolderList
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            selectedPlaylistId={selectedPlaylistId}
            onPlaylistSelect={handlePlaylistSelect}
            selectedCustomPlaylistId={selectedCustomPlaylistId}
            onCustomPlaylistSelect={handleCustomPlaylistSelect}
          />
        }
        main={children}
        detail={selectedSongId ? <DetailPanel songId={selectedSongId} /> : undefined}
      />
    </>
  )
}

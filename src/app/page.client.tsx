'use client'

import { BulkSummaryModal } from '@/components/bulk-summary-modal'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { MainContent } from '@/components/panels/main-content/main-content'
import { ScanSummaryModal } from '@/components/scan-summary-modal'
import { StarPromptDialog } from '@/components/star-prompt-dialog'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function HomeClientPage() {
  const { selectedFolderId, setSelectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId, setSelectedPlaylistId } = useSelectedPlaylist()
  const { selectedSongId, setSelectedSongId } = useSelectedSong()
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)
  const clearBulkSelect = useBulkSelectionStore(s => s.clear)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedPlaylistId(null)
    setSelectedSongId(null)
    setFolderSheetOpen(false)
    clearBulkSelect()
  }

  const handlePlaylistSelect = (playlistId: number | null) => {
    setSelectedPlaylistId(playlistId)
    setSelectedFolderId(null)
    setSelectedSongId(null)
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
          />
        }
        main={<MainContent />}
        detail={selectedSongId ? <DetailPanel songId={selectedSongId} /> : undefined}
      />
    </>
  )
}

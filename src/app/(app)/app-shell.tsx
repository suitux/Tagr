'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { BulkSummaryModal } from '@/components/bulk-summary-modal'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { ScanSummaryModal } from '@/components/scan-summary-modal'
import { StarPromptDialog } from '@/components/star-prompt-dialog'
import { useLibraryNavigation } from '@/hooks/use-library-navigation'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useSelectedView } from '@/hooks/use-selected-view'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const { selectedSongId } = useSelectedSong()
  const { selectedView } = useSelectedView()
  const { navigateToFolder, navigateToPlaylist, navigateToRecentListens } = useLibraryNavigation()
  const setFolderSheetOpen = useMobileNavStore(s => s.setFolderSheetOpen)
  const clearBulkSelect = useBulkSelectionStore(s => s.clear)

  useEffect(() => {
    clearBulkSelect()
    setFolderSheetOpen(false)
  }, [pathname, clearBulkSelect, setFolderSheetOpen])

  const handleFolderSelect = (folderId: string | null) => navigateToFolder(folderId)
  const handlePlaylistSelect = (playlistId: number | null) => navigateToPlaylist(playlistId)
  const handleRecentListensSelect = () => navigateToRecentListens()

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
            selectedView={selectedView}
            onRecentListensSelect={handleRecentListensSelect}
          />
        }
        main={children}
        detail={selectedSongId ? <DetailPanel songId={selectedSongId} /> : undefined}
      />
    </>
  )
}

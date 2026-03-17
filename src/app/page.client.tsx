'use client'

import { useQueryState } from 'nuqs'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { MainContent } from '@/components/panels/main-content/main-content'
import { ScanSummaryModal } from '@/components/scan-summary-modal'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedSong } from '@/hooks/use-selected-song'

export function HomeClientPage() {
  const { selectedFolderId, setSelectedFolderId } = useSelectedFolder()
  const { selectedSongId, setSelectedSongId } = useSelectedSong()

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedSongId(null)
  }

  return (
    <>
      <ScanSummaryModal />
      <ResponsiveLayout
        sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
        main={<MainContent />}
        detail={selectedSongId ? <DetailPanel songId={selectedSongId} /> : undefined}
      />
    </>
  )
}

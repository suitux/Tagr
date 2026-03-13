'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { MainContent } from '@/components/panels/main-content/main-content'
import { ScanSummaryModal } from '@/components/scan-summary-modal'

export function HomeClientPage() {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folder')
  const [selectedSong, setSelectedSong] = useQueryState('song', parseAsInteger)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedSong(null)
  }

  return (
    <>
      <ScanSummaryModal />
      <ThreeColumnLayout
        sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
        main={<MainContent />}
        detail={selectedSong ? <DetailPanel songId={selectedSong} /> : undefined}
      />
    </>
  )
}

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { FolderList } from '@/components/panels/folder-list/folder-list'
import { MainContent } from '@/components/panels/main-content/main-content'

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folder')
  const [selectedSong, setSelectedSong] = useQueryState('song', parseAsInteger)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedSong(null)
  }

  const handleSongSelect = (songId: number | null) => {
    setSelectedSong(songId)
  }

  return (
    <ThreeColumnLayout
      sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
      main={
        <MainContent
          selectedFolderId={selectedFolderId}
          selectedSongId={selectedSong}
          onSongSelect={handleSongSelect}
        />
      }
      detail={selectedSong ? <DetailPanel songId={selectedSong} /> : undefined}
    />
  )
}

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { HomeProvider } from '@/contexts/home-context'
import { PlayerProvider } from '@/contexts/player-context'
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
    <PlayerProvider>
      <HomeProvider
        selectedFolderId={selectedFolderId}
        selectedSongId={selectedSong}
        onFolderSelect={handleFolderSelect}
        onSongSelect={handleSongSelect}
      >
        <ThreeColumnLayout
          sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
          main={<MainContent />}
          detail={selectedSong ? <DetailPanel songId={selectedSong} /> : undefined}
        />
      </HomeProvider>
    </PlayerProvider>
  )
}

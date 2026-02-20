'use client'

import { useState } from 'react'
import { FolderList } from '@/components/folders/folder-list/folder-list'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { DetailPanel } from '@/components/panels/detail-panel/detail-panel'
import { MainContent } from '@/components/panels/main-content/main-content'
import { Song } from '@/features/songs/domain'

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedSong(null)
  }

  const handleSongSelect = (song: Song | null) => {
    setSelectedSong(song)
  }

  return (
    <ThreeColumnLayout
      sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
      main={
        <MainContent selectedFolderId={selectedFolderId} selectedSong={selectedSong} onSongSelect={handleSongSelect} />
      }
      detail={selectedSong ? <DetailPanel songId={selectedSong.id} /> : undefined}
    />
  )
}

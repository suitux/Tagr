'use client'

import { useState } from 'react'
import { FolderList } from '@/components/folders/folder-list'
import { ThreeColumnLayout } from '@/components/layout/three-column-layout'
import { DetailPanel } from '@/components/panels/detail-panel'
import { MusicFile } from '@/features/music-files/domain'

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<MusicFile | null>(null)

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedFile(null)
  }

  // const handleFileSelect = (file: MusicFile | null) => {
  //   setSelectedFile(file)
  // }

  return (
    <ThreeColumnLayout
      sidebar={<FolderList selectedFolderId={selectedFolderId} onFolderSelect={handleFolderSelect} />}
      detail={selectedFile ? <DetailPanel file={selectedFile} /> : undefined}
    />
  )
}

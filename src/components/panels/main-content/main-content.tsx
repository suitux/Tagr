'use client'

import { useHome } from '@/contexts/home-context'
import { MainContentEmptyFolderState } from './components/main-content-empty-folder-state'
import { MainContentFileList } from './components/main-content-file-list'
import { MainContentHeader } from './components/main-content-header'

export function MainContent() {
  const { selectedFolderId } = useHome()

  if (!selectedFolderId) {
    return <MainContentEmptyFolderState />
  }

  return (
    <div className='flex flex-col h-full'>
      <MainContentHeader />
      <MainContentFileList />
    </div>
  )
}

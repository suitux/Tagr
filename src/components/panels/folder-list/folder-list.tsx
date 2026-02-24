'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { FolderListEmptyState } from './components/folder-list-empty-state'
import { FolderListErrorState } from './components/folder-list-error-state'
import { FolderListHeader } from './components/folder-list-header'
import { FolderListItem } from './components/folder-list-item'
import { FolderListLoadingState } from './components/folder-list-loading-state'
import { FolderListSearch } from './components/folder-list-search'
import { SidebarPlayer } from './components/sidebar-player'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export function FolderList({ onFolderSelect, selectedFolderId }: FolderListProps) {
  const { data, isLoading, error } = useFolders()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFolders =
    data?.folders.filter(folder => {
      const folderName = folder.folder.toLowerCase()
      return folderName.includes(searchQuery.toLowerCase())
    }) ?? []

  if (isLoading) {
    return <FolderListLoadingState />
  }

  if (error) {
    return <FolderListErrorState />
  }

  return (
    <div className='flex flex-col h-full'>
      <FolderListHeader />

      <FolderListSearch value={searchQuery} onChange={setSearchQuery} />

      <Separator />

      <ScrollArea className='flex-1'>
        <div className='p-2'>
          {filteredFolders.length === 0 ? (
            <FolderListEmptyState hasSearchQuery={!!searchQuery} />
          ) : (
            <div className='space-y-1'>
              {filteredFolders.map(folder => (
                <FolderListItem
                  key={folder.folder}
                  folder={folder}
                  isSelected={selectedFolderId === folder.folder}
                  onFolderSelect={onFolderSelect}
                  selectedFolderId={selectedFolderId}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />
      <SidebarPlayer />
    </div>
  )
}

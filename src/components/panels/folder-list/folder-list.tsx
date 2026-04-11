'use client'

import { useState } from 'react'
import { SidebarPlayer } from '@/components/sidebar-player/sidebar-player'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { AllFoldersListItem } from './components/all-folders-list-item'
import { FolderListEmptyState } from './components/folder-list-empty-state'
import { FolderListErrorState } from './components/folder-list-error-state'
import { FolderListHeader } from './components/folder-list-header'
import { FolderListItem } from './components/folder-list-item'
import { FolderListLoadingState } from './components/folder-list-loading-state'
import { FolderListSearch } from './components/folder-list-search'
import { SmartPlaylistsSection } from './components/smart-playlists/smart-playlists-section'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
  onPlaylistSelect?: (playlistId: number | null) => void
  selectedPlaylistId?: number | null
}

export function FolderList({
  onFolderSelect,
  selectedFolderId,
  onPlaylistSelect,
  selectedPlaylistId
}: FolderListProps) {
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const hasSearch = search.length > 0
  const { data, isLoading, error } = useFolders(undefined, hasSearch ? search : undefined)
  const folders = data?.folders ?? []

  if (isLoading && !hasSearch) {
    return <FolderListLoadingState />
  }

  if (error) {
    return <FolderListErrorState />
  }

  return (
    <div className='flex flex-col h-full'>
      <FolderListHeader />

      <FolderListSearch onChange={setSearch} />

      <Separator />

      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-2'>
          {!hasSearch && onPlaylistSelect && (
            <SmartPlaylistsSection
              selectedPlaylistId={selectedPlaylistId ?? null}
              onPlaylistSelect={onPlaylistSelect}
            />
          )}

          {!hasSearch && (
            <AllFoldersListItem
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
            />
          )}

          {(!hasSearch ? isExpanded : true) &&
            (folders.length === 0 ? (
              <FolderListEmptyState hasSearchQuery={hasSearch} />
            ) : (
              <div className='space-y-1 mt-1'>
                {folders.map(folder => (
                  <FolderListItem
                    key={folder.folder}
                    folder={folder}
                    isSelected={selectedFolderId === folder.folder}
                    onFolderSelect={onFolderSelect}
                    selectedFolderId={selectedFolderId}
                  />
                ))}
              </div>
            ))}
        </div>
      </ScrollArea>

      <div className='hidden md:block'>
        <Separator />
        <SidebarPlayer />
      </div>
    </div>
  )
}

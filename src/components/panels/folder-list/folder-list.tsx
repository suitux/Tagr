'use client'

import { FolderIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SidebarPlayer } from '@/components/sidebar-player/sidebar-player'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useFolders } from '@/features/folders/hooks/use-folders'
import type { MainView } from '@/hooks/use-selected-view'
import { AllFoldersListItem } from './components/all-folders-list-item'
import { FolderListEmptyState } from './components/folder-list-empty-state'
import { FolderListErrorState } from './components/folder-list-error-state'
import { FolderListHeader } from './components/folder-list-header'
import { FolderListItem } from './components/folder-list-item'
import { FolderListLoadingState } from './components/folder-list-loading-state'
import { FolderListSearch } from './components/folder-list-search'
import { ListItemGroup } from './components/list-item-group'
import { RecentListensListItem } from './components/recent-listens-list-item'
import { SmartPlaylistsSection } from './components/smart-playlists/smart-playlists-section'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
  onPlaylistSelect?: (playlistId: number | null) => void
  selectedPlaylistId?: number | null
  selectedView?: MainView | null
  onRecentListensSelect?: () => void
}

export function FolderList({
  onFolderSelect,
  selectedFolderId,
  onPlaylistSelect,
  selectedPlaylistId,
  selectedView,
  onRecentListensSelect
}: FolderListProps) {
  const t = useTranslations('navigation')
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

          <ListItemGroup
            icon={<FolderIcon className='w-4 h-4 text-muted-foreground' />}
            label={t('folders')}
            isExpanded={hasSearch || isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}>
            {!hasSearch && (
              <AllFoldersListItem
                selectedFolderId={selectedFolderId}
                onFolderSelect={onFolderSelect}
              />
            )}
            {folders.length === 0 ? (
              <FolderListEmptyState hasSearchQuery={hasSearch} />
            ) : (
              folders.map(folder => (
                <FolderListItem
                  key={folder.folder}
                  folder={folder}
                  isSelected={selectedFolderId === folder.folder}
                  onFolderSelect={onFolderSelect}
                  selectedFolderId={selectedFolderId}
                />
              ))
            )}
          </ListItemGroup>

          {!hasSearch && onRecentListensSelect && (
            <RecentListensListItem isSelected={selectedView === 'recent'} onSelect={onRecentListensSelect} />
          )}
        </div>
      </ScrollArea>

      <div className='hidden md:block'>
        <Separator />
        <SidebarPlayer />
      </div>
    </div>
  )
}

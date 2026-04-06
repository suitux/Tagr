'use client'

import { LibraryIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SidebarPlayer } from '@/components/sidebar-player/sidebar-player'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { cn } from '@/lib/utils'
import { FolderListEmptyState } from './components/folder-list-empty-state'
import { FolderListErrorState } from './components/folder-list-error-state'
import { FolderListHeader } from './components/folder-list-header'
import { FolderListItem } from './components/folder-list-item'
import { FolderListLoadingState } from './components/folder-list-loading-state'
import { FolderListSearch } from './components/folder-list-search'

interface FolderListProps {
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export function FolderList({ onFolderSelect, selectedFolderId }: FolderListProps) {
  const t = useTranslations('folders')
  const { data, isLoading, error } = useFolders()
  const [searchQuery, setSearchQuery] = useState('')
  const isAllSelected = selectedFolderId === ALL_SONGS_FOLDER_ID

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

      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-2'>
          <Button
            variant={isAllSelected ? 'secondary' : 'ghost'}
            onClick={() => onFolderSelect?.(ALL_SONGS_FOLDER_ID)}
            className={cn(
              'w-full justify-start gap-2 h-auto px-3 py-2.5 mb-1 cursor-pointer',
              isAllSelected && 'bg-accent shadow-sm'
            )}>
            <div className='w-5 h-5' />
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                isAllSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
              <LibraryIcon className='w-5 h-5' />
            </div>
            <p className={cn('text-sm font-medium', isAllSelected ? 'text-foreground' : 'text-foreground/80')}>
              {t('allSongs')}
            </p>
            {isAllSelected && <div className='ml-auto w-1.5 h-8 bg-primary rounded-full' />}
          </Button>

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

      <div className='hidden md:block'>
        <Separator />
        <SidebarPlayer />
      </div>
    </div>
  )
}

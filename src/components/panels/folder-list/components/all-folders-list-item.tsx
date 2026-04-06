'use client'

import { ChevronRightIcon, LibraryIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { cn } from '@/lib/utils'

interface AllFoldersListItemProps {
  isExpanded: boolean
  onToggleExpand: () => void
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
}

export function AllFoldersListItem({
  isExpanded,
  onToggleExpand,
  selectedFolderId,
  onFolderSelect
}: AllFoldersListItemProps) {
  const t = useTranslations('folders')
  const isAllSelected = selectedFolderId === ALL_SONGS_FOLDER_ID

  return (
    <Button
      variant={isAllSelected ? 'secondary' : 'ghost'}
      onClick={() => onFolderSelect?.(ALL_SONGS_FOLDER_ID)}
      className={cn(
        'w-full justify-start gap-2 h-auto px-3 py-2.5 cursor-pointer',
        isAllSelected && 'bg-accent shadow-sm'
      )}>
      <span
        onClick={e => {
          e.stopPropagation()
          onToggleExpand()
        }}
        className='flex items-center justify-center w-5 h-5 rounded hover:bg-muted-foreground/20 transition-colors'>
        <ChevronRightIcon
          className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')}
        />
      </span>
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
          isAllSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}>
        <LibraryIcon className='w-5 h-5' />
      </div>
      <p className={cn('text-sm font-medium', isAllSelected ? 'text-foreground' : 'text-foreground/80')}>
        {t('allFolders')}
      </p>
      {isAllSelected && <div className='ml-auto w-1.5 h-8 bg-primary rounded-full' />}
    </Button>
  )
}

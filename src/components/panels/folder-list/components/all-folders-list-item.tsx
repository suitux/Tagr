'use client'

import { LibraryIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { ListItem } from './list-item'

interface AllFoldersListItemProps {
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
}

export function AllFoldersListItem({ selectedFolderId, onFolderSelect }: AllFoldersListItemProps) {
  const t = useTranslations('folders')
  const isAllSelected = selectedFolderId === ALL_SONGS_FOLDER_ID

  return (
    <ListItem
      isSelected={isAllSelected}
      onClick={() => onFolderSelect?.(ALL_SONGS_FOLDER_ID)}
      icon={<LibraryIcon className='w-5 h-5' />}
      label={t('allFolders')}
    />
  )
}

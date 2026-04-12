'use client'

import { useQueryState } from 'nuqs'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

export function useSelectedFolder() {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folder', {
    history: 'replace'
  })
  return { selectedFolderId, setSelectedFolderId }
}

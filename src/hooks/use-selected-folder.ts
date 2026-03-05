'use client'

import { useQueryState } from 'nuqs'

export function useSelectedFolder() {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folder')
  return { selectedFolderId, setSelectedFolderId }
}

'use client'

import { useQueryState } from 'nuqs'

export function useSelectedFolder() {
  const [selectedFolderId, setSelectedFolderId] = useQueryState('folder', { history: 'replace' })
  return { selectedFolderId, setSelectedFolderId }
}

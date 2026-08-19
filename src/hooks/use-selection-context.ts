'use client'

import { useMemo } from 'react'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useSelectedView } from '@/hooks/use-selected-view'
import type { SelectionContext } from '@/stores/bulk-selection-store'
import { useHomeStore } from '@/stores/home-store'

export function useSelectionContext(): SelectionContext | null {
  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const { selectedView } = useSelectedView()
  const search = useHomeStore(s => s.search)
  const columnFilters = useHomeStore(s => s.columnFilters)

  return useMemo(() => {
    const activeEntries = Object.entries(columnFilters).filter(([, value]) => value)
    const scope = {
      search: search || undefined,
      filters: activeEntries.length > 0 ? Object.fromEntries(activeEntries) : undefined
    }

    if (selectedView === 'recent') return { type: 'recent-listens', ...scope }
    if (selectedPlaylistId !== null) return { type: 'smart-playlist', playlistId: selectedPlaylistId, ...scope }
    if (selectedFolderId) return { type: 'folder', folderPath: selectedFolderId, ...scope }

    return null
  }, [columnFilters, search, selectedFolderId, selectedPlaylistId, selectedView])
}

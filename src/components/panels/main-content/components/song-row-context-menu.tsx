'use client'

import { useMemo, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { type Song } from '@/features/songs/domain'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import {
  type SelectionContext,
  useBulkSelectionStore,
  useIsSelectionActive
} from '@/stores/bulk-selection-store'
import { useHomeStore } from '@/stores/home-store'

interface SongRowContextMenuProps {
  row: Song
  children: ReactNode
  totalSongs: number | null
}

export function SongRowContextMenu({ row, children, totalSongs }: SongRowContextMenuProps) {
  const tBulk = useTranslations('bulkEdit')

  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const search = useHomeStore(s => s.search)
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilters = useMemo(() => {
    const entries = Object.entries(columnFilters).filter(([, v]) => v)
    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }, [columnFilters])

  const toggle = useBulkSelectionStore(s => s.toggle)
  const selectAllInContext = useBulkSelectionStore(s => s.selectAllInContext)
  const clear = useBulkSelectionStore(s => s.clear)
  const isActive = useIsSelectionActive()

  const handleSelectAll = () => {
    let context: SelectionContext | null = null
    if (selectedPlaylistId !== null) {
      context = { type: 'smart-playlist', playlistId: selectedPlaylistId, search: search || undefined, filters: activeFilters }
    } else if (selectedFolderId) {
      context = { type: 'folder', folderPath: selectedFolderId, search: search || undefined, filters: activeFilters }
    }
    if (!context || totalSongs === null || totalSongs === 0) return
    selectAllInContext(context, totalSongs)
  }

  const allLabel =
    selectedPlaylistId !== null ? tBulk('contextMenu.selectAllPlaylist') : tBulk('contextMenu.selectAllFolder')

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => toggle(row.id)}>{tBulk('contextMenu.selectSong')}</ContextMenuItem>
        <ContextMenuItem onSelect={handleSelectAll} disabled={totalSongs === null || totalSongs === 0}>
          {allLabel}
        </ContextMenuItem>
        {isActive && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => clear()}>{tBulk('contextMenu.clearSelection')}</ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

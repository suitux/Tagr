'use client'

import { CheckSquareIcon, FolderCheckIcon, HistoryIcon, ListChecksIcon, XIcon, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { type Song } from '@/features/songs/domain'
import { useSelectionContext } from '@/hooks/use-selection-context'
import { type SelectionContext, useBulkSelectionStore, useIsSelectionActive } from '@/stores/bulk-selection-store'

const SELECT_ALL_ACTIONS = {
  folder: { icon: FolderCheckIcon, labelKey: 'contextMenu.selectAllFolder' },
  'smart-playlist': { icon: ListChecksIcon, labelKey: 'contextMenu.selectAllPlaylist' },
  'recent-listens': { icon: HistoryIcon, labelKey: 'contextMenu.selectAllRecent' }
} as const satisfies Record<SelectionContext['type'], { icon: LucideIcon; labelKey: string }>

interface SongRowContextMenuProps {
  row: Song
  children: ReactNode
  totalSongs: number | null
}

export function SongRowContextMenu({ row, children, totalSongs }: SongRowContextMenuProps) {
  const tBulk = useTranslations('bulkEdit')

  const context = useSelectionContext()

  const toggle = useBulkSelectionStore(s => s.toggle)
  const selectAllInContext = useBulkSelectionStore(s => s.selectAllInContext)
  const clear = useBulkSelectionStore(s => s.clear)
  const isActive = useIsSelectionActive()

  const handleSelectAll = () => {
    if (!context || totalSongs === null || totalSongs === 0) return
    selectAllInContext(context, totalSongs)
  }

  const { icon: AllIcon, labelKey } = SELECT_ALL_ACTIONS[context?.type ?? 'folder']

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => toggle(row.id)}>
          <CheckSquareIcon />
          {tBulk('contextMenu.selectSong')}
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleSelectAll} disabled={totalSongs === null || totalSongs === 0}>
          <AllIcon />
          {tBulk(labelKey)}
        </ContextMenuItem>
        {isActive && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => clear()}>
              <XIcon />
              {tBulk('contextMenu.clearSelection')}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

'use client'

import { CheckSquareIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import {
  type SelectionContext,
  useBulkSelectionStore,
  useIsSelectionActive
} from '@/stores/bulk-selection-store'
import { useHomeStore } from '@/stores/home-store'

interface SelectAllSongsButtonProps {
  totalSongs: number | null
}

export function SelectAllSongsButton({ totalSongs }: SelectAllSongsButtonProps) {
  const tBulk = useTranslations('bulkEdit')

  const { selectedFolderId } = useSelectedFolder()
  const { selectedPlaylistId } = useSelectedPlaylist()
  const search = useHomeStore(s => s.search)
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilters = useMemo(() => {
    const entries = Object.entries(columnFilters).filter(([, v]) => v)
    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }, [columnFilters])

  const selectAllInContext = useBulkSelectionStore(s => s.selectAllInContext)
  const clear = useBulkSelectionStore(s => s.clear)
  const isActive = useIsSelectionActive()

  const disabled = totalSongs === null || totalSongs === 0

  const handleClick = () => {
    if (isActive) {
      clear()
      return
    }
    let context: SelectionContext | null = null
    if (selectedPlaylistId !== null) {
      context = {
        type: 'smart-playlist',
        playlistId: selectedPlaylistId,
        search: search || undefined,
        filters: activeFilters
      }
    } else if (selectedFolderId) {
      context = {
        type: 'folder',
        folderPath: selectedFolderId,
        search: search || undefined,
        filters: activeFilters
      }
    }
    if (!context || totalSongs === null || totalSongs === 0) return
    selectAllInContext(context, totalSongs)
  }

  return (
    <Button variant='outline' size='sm' onClick={handleClick} disabled={disabled}>
      <CheckSquareIcon />
      {isActive ? tBulk('actionBar.cancel') : tBulk('selectAllButton')}
    </Button>
  )
}

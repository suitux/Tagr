'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { type SelectionContext, useBulkSelectionStore, useSelectionCount } from '@/stores/bulk-selection-store'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useHomeStore } from '@/stores/home-store'

interface SelectAllHeaderCheckboxProps {
  totalSongs: number | null
}

export function SelectAllHeaderCheckbox({ totalSongs }: SelectAllHeaderCheckboxProps) {
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
  const selectionCount = useSelectionCount()

  const total = totalSongs ?? 0
  const checked: boolean | 'indeterminate' =
    total === 0 ? false : selectionCount === 0 ? false : selectionCount >= total ? true : 'indeterminate'

  const handleClick = () => {
    if (checked === true) {
      clear()
      return
    }

    let context: SelectionContext | null = null
    if (selectedPlaylistId !== null) {
      context = { type: 'smart-playlist', playlistId: selectedPlaylistId, search: search || undefined, filters: activeFilters }
    } else if (selectedFolderId) {
      context = { type: 'folder', folderPath: selectedFolderId, search: search || undefined, filters: activeFilters }
    }
    if (!context || total === 0) return
    selectAllInContext(context, total)
  }

  return (
    <div className='flex items-center justify-center' onClick={e => e.stopPropagation()}>
      <Checkbox checked={checked} onCheckedChange={handleClick} aria-label={tBulk('selectAllButton')} />
    </div>
  )
}

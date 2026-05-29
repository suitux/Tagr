'use client'

import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { useBulkSelectionStore, useIsSongSelected } from '@/stores/bulk-selection-store'

interface RowSelectCheckboxProps {
  songId: number
}

export function RowSelectCheckbox({ songId }: RowSelectCheckboxProps) {
  const tBulk = useTranslations('bulkEdit')
  const checked = useIsSongSelected(songId)
  const toggle = useBulkSelectionStore(s => s.toggle)

  return (
    <div
      className='flex items-center justify-center animate-in fade-in zoom-in-75 slide-in-from-left-2 duration-200'
      onClick={e => {
        e.stopPropagation()
      }}>
      <Checkbox
        checked={checked}
        onCheckedChange={() => toggle(songId)}
        aria-label={tBulk('contextMenu.selectSong')}
      />
    </div>
  )
}

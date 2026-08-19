'use client'

import { CheckSquareIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useSelectionContext } from '@/hooks/use-selection-context'
import { useBulkSelectionStore, useIsSelectionActive } from '@/stores/bulk-selection-store'

interface SelectAllSongsButtonProps {
  totalSongs: number | null
}

export function SelectAllSongsButton({ totalSongs }: SelectAllSongsButtonProps) {
  const tBulk = useTranslations('bulkEdit')

  const context = useSelectionContext()

  const selectAllInContext = useBulkSelectionStore(s => s.selectAllInContext)
  const clear = useBulkSelectionStore(s => s.clear)
  const isActive = useIsSelectionActive()

  const disabled = totalSongs === null || totalSongs === 0

  const handleClick = () => {
    if (isActive) {
      clear()
      return
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

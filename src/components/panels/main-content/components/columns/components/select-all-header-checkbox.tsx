'use client'

import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { useSelectionContext } from '@/hooks/use-selection-context'
import { useBulkSelectionStore, useSelectionCount } from '@/stores/bulk-selection-store'

interface SelectAllHeaderCheckboxProps {
  totalSongs: number | null
}

export function SelectAllHeaderCheckbox({ totalSongs }: SelectAllHeaderCheckboxProps) {
  const tBulk = useTranslations('bulkEdit')
  const context = useSelectionContext()

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

    if (!context || total === 0) return
    selectAllInContext(context, total)
  }

  return (
    <div
      className='flex items-center justify-center animate-in fade-in zoom-in-75 slide-in-from-left-2 duration-200'
      onClick={e => e.stopPropagation()}
    >
      <Checkbox checked={checked} onCheckedChange={handleClick} aria-label={tBulk('selectAllButton')} />
    </div>
  )
}

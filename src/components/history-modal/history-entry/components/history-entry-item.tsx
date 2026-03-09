import { PICTURE_FIELD } from '@/features/history/consts'
import { PictureHistoryEntryItem } from './picture-history-entry-item'
import { TextHistoryEntryItem } from './text-history-entry-item'

interface HistoryEntryItemProps {
  field: string
  fieldLabel: string
  oldValue: string | null
  newValue: string | null
}

export function HistoryEntryItem({ field, fieldLabel, oldValue, newValue }: HistoryEntryItemProps) {
  if (field === PICTURE_FIELD) {
    return <PictureHistoryEntryItem fieldLabel={fieldLabel} oldValue={oldValue} newValue={newValue} />
  }

  return <TextHistoryEntryItem fieldLabel={fieldLabel} oldValue={oldValue} newValue={newValue} />
}

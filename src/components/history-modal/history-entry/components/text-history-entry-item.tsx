interface TextHistoryEntryItemProps {
  fieldLabel: string
  oldValue: string | null
  newValue: string | null
}

export function TextHistoryEntryItem({ fieldLabel, oldValue, newValue }: TextHistoryEntryItemProps) {
  return (
    <div className='mt-1 text-xs text-muted-foreground truncate'>
      <span className='font-medium text-foreground/80'>{fieldLabel}</span>
      {': '}
      <span className='text-red-400 line-through'>{oldValue}</span>
      {' → '}
      <span className='text-green-400'>{newValue}</span>
    </div>
  )
}

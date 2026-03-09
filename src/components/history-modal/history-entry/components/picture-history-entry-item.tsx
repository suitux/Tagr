import { Image } from '@/components/ui/image'
import { ImageIcon } from 'lucide-react'

interface PictureHistoryEntryItemProps {
  fieldLabel: string
  oldValue: string | null
  newValue: string | null
}

export function PictureHistoryEntryItem({ fieldLabel, oldValue, newValue }: PictureHistoryEntryItemProps) {
  return (
    <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
      <span className='font-medium text-foreground/80'>{fieldLabel}</span>
      {': '}
      {oldValue ? (
        <Image src={oldValue} alt='' width={32} height={32} unoptimized className='h-8 w-8 rounded object-cover border border-red-400' fallbackComponent={<ImageIcon className='h-4 w-4 text-red-400' />} />
      ) : (
        <ImageIcon className='h-4 w-4 text-red-400' />
      )}
      {' → '}
      {newValue ? (
        <Image src={newValue} alt='' width={32} height={32} unoptimized className='h-8 w-8 rounded object-cover border border-green-400' fallbackComponent={<ImageIcon className='h-4 w-4 text-green-400' />} />
      ) : (
        <ImageIcon className='h-4 w-4 text-green-400' />
      )}
    </div>
  )
}

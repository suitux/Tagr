import { MusicIcon } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { cn } from '@/lib/utils'

interface DetailPanelHeaderProps {
  title: string
  subtitle: string
  pictureUrl?: string | null
  hasPicture: boolean
  extColor: string
}

export function DetailPanelHeader({ title, subtitle, pictureUrl, hasPicture, extColor }: DetailPanelHeaderProps) {
  return (
    <div className='flex-shrink-0 p-5'>
      <div className='flex items-center gap-3'>
        {hasPicture && pictureUrl ? (
          <div className='w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg relative'>
            <Image src={pictureUrl} alt={title} fill className='object-cover rounded-xl' unoptimized />
          </div>
        ) : (
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
              extColor
            )}>
            <MusicIcon className='w-6 h-6 text-white' />
          </div>
        )}

        <div className='flex-1 min-w-0'>
          <h2 className='text-sm font-semibold text-foreground truncate'>{title}</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

import { ClockIcon, MusicIcon, PlayCircleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Song } from '@/features/songs/domain'
import { cn } from '@/lib/utils'
import { formatDate, formatFileSize, getExtensionVariant } from '../utils'

interface FileItemProps {
  song: Song
  isSelected?: boolean
  onClick?: () => void
}

export function FileItem({ song, isSelected, onClick }: FileItemProps) {
  const displayName = song.title || song.fileName

  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      onClick={onClick}
      className={cn(
        'w-full h-auto py-3 px-4 grid grid-cols-[1fr_100px_120px] gap-4 items-center cursor-pointer',
        isSelected && 'bg-accent shadow-sm'
      )}>
      <div className='flex items-center gap-3 min-w-0'>
        <div className='relative flex-shrink-0'>
          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
            <MusicIcon className='w-5 h-5 text-muted-foreground' />
          </div>
          {isSelected && <PlayCircleIcon className='absolute -bottom-1 -right-1 w-5 h-5 text-primary' />}
        </div>
        <div className='min-w-0 flex-1 text-left'>
          <p className='text-sm font-medium text-foreground truncate'>{displayName}</p>
          <div className='flex items-center gap-2 mt-0.5'>
            <Badge variant={getExtensionVariant(song.extension)} className='text-[10px] h-4'>
              {song.extension.toUpperCase()}
            </Badge>
            {song.artist && <span className='text-xs text-muted-foreground truncate'>{song.artist}</span>}
          </div>
        </div>
      </div>

      <span className='text-sm text-muted-foreground text-right'>{formatFileSize(song.fileSize)}</span>

      <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
        <ClockIcon className='w-3.5 h-3.5' />
        <span>{formatDate(song.modifiedAt)}</span>
      </div>
    </Button>
  )
}

'use client'

import { ChevronDown, ChevronUp, MusicIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface SidebarPlayerImageProps {
  expanded: boolean
  onToggleExpanded: () => void
}

export function SidebarPlayerImage({ expanded, onToggleExpanded }: SidebarPlayerImageProps) {
  const currentSong = usePlayerStore(s => s.currentSong)
  const { setSelectedSongId } = useSelectedSong()

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id, currentSong.modifiedAt)

  const handleSongTitleClick = () => {
    setSelectedSongId(currentSong.id)
  }

  return (
    <>
      <div className={cn('flex items-center', expanded ? 'justify-end' : 'gap-3')}>
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center',
            expanded && 'hidden'
          )}>
          <Image
            src={pictureUrl}
            alt=''
            width={40}
            height={40}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-5 h-5 text-muted-foreground' />}
          />
        </div>

        <div className={cn('min-w-0 flex-1', expanded && 'hidden')}>
          <p className='text-sm font-medium truncate cursor-pointer hover:underline' onClick={handleSongTitleClick}>
            {currentSong.title || currentSong.fileName}
          </p>
          {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={cn('flex-shrink-0', expanded ? 'h-6 w-6' : 'h-7 w-7')}
          onClick={onToggleExpanded}>
          {expanded ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-3.5 w-3.5' />}
        </Button>
      </div>

      <div className={cn('flex justify-center', !expanded && 'hidden')}>
        <div className='w-full max-w-64 aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center'>
          <Image
            src={pictureUrl}
            alt=''
            width={300}
            height={300}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-12 h-12 text-muted-foreground' />}
          />
        </div>
      </div>

      <div className={cn('text-center space-y-0.5', !expanded && 'hidden')}>
        <p className='text-sm font-medium truncate cursor-pointer hover:underline' onClick={handleSongTitleClick}>
          {currentSong.title || currentSong.fileName}
        </p>
        {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        {currentSong.album && <p className='text-xs text-muted-foreground/70 truncate'>{currentSong.album}</p>}
      </div>
    </>
  )
}

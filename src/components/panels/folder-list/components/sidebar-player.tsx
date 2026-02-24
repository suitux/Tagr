'use client'

import { MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { usePlayer } from '@/contexts/player-context'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'

export function SidebarPlayer() {
  const { currentSong, isPlaying, togglePlayPause, playNext, playPrevious, queueIndex, queue } = usePlayer()

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id)
  const hasPrevious = queueIndex > 0
  const hasNext = queueIndex < queue.length - 1

  return (
    <div className='p-3 flex items-center gap-3'>
      <div className='flex-shrink-0 w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center'>
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
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium truncate'>{currentSong.title || currentSong.fileName}</p>
        {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
      </div>
      <div className='flex items-center gap-0.5'>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={playPrevious} disabled={!hasPrevious}>
          <SkipBack className='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={togglePlayPause}>
          {isPlaying ? <Pause className='h-3.5 w-3.5' /> : <Play className='h-3.5 w-3.5' />}
        </Button>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={playNext} disabled={!hasNext}>
          <SkipForward className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  )
}

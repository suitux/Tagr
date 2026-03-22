'use client'

import { MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useMobileNavStore } from '@/stores/mobile-nav-store'
import { usePlayerStore } from '@/stores/player-store'

export function MobilePlayer() {
  const currentSong = usePlayerStore(s => s.currentSong)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const playPrevious = usePlayerStore(s => s.playPrevious)
  const playNext = usePlayerStore(s => s.playNext)
  const _previousSong = usePlayerStore(s => s._previousSong)
  const _nextSong = usePlayerStore(s => s._nextSong)
  const { setSelectedSongId } = useSelectedSong()
  const setDetailSheetOpen = useMobileNavStore(s => s.setDetailSheetOpen)

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id, currentSong.modifiedAt)

  const openDetail = () => {
    setSelectedSongId(currentSong.id)
    setDetailSheetOpen(true)
  }

  return (
    <div className='fixed bottom-14 inset-x-0 z-40 flex h-14 items-center gap-3 border-t bg-background/95 backdrop-blur-sm px-3'>
      <button type='button' className='flex min-w-0 flex-1 items-center gap-3' onClick={openDetail}>
        <div className='w-10 h-10 flex-shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center'>
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

        <div className='min-w-0 flex-1 text-left'>
          <p className='text-sm font-medium truncate'>{currentSong.title || currentSong.fileName}</p>
          {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        </div>
      </button>

      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='icon' className='h-9 w-9' onClick={playPrevious} disabled={!_previousSong}>
          <SkipBack className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon' className='h-9 w-9' onClick={togglePlayPause}>
          {isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
        </Button>
        <Button variant='ghost' size='icon' className='h-9 w-9' onClick={playNext} disabled={!_nextSong}>
          <SkipForward className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

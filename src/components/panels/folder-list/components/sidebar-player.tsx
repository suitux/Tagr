'use client'

import { ChevronDown, ChevronUp, MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { Waveform } from '@/components/waveform'
import { usePlayer } from '@/contexts/player-context'
import { getSongAudioUrl, getSongPictureUrl } from '@/features/songs/song-file-helpers'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SidebarPlayer() {
  const [expanded, setExpanded] = useState(true)
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    hasPrevious,
    hasNext,
    currentTime,
    duration,
    seek
  } = usePlayer()

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id)

  if (expanded) {
    return (
      <div className='p-4 space-y-3'>
        <div className='flex justify-end'>
          <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setExpanded(false)}>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex justify-center'>
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

        <div className='text-center space-y-0.5'>
          <p className='text-sm font-medium truncate'>{currentSong.title || currentSong.fileName}</p>
          {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
          {currentSong.album && <p className='text-xs text-muted-foreground/70 truncate'>{currentSong.album}</p>}
        </div>

        <div className='flex items-center justify-center gap-2'>
          <Button variant='ghost' size='icon' className='h-9 w-9' onClick={playPrevious} disabled={!hasPrevious}>
            <SkipBack className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' className='h-10 w-10' onClick={togglePlayPause}>
            {isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
          </Button>
          <Button variant='ghost' size='icon' className='h-9 w-9' onClick={playNext} disabled={!hasNext}>
            <SkipForward className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>
            {formatTime(currentTime)}
          </span>
          <Waveform url={getSongAudioUrl(currentSong.id)} currentTime={currentTime} duration={duration} onSeek={seek} />
          <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTime(duration)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='p-3 space-y-2'>
      <div className='flex items-center gap-3'>
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
        <Button variant='ghost' size='icon' className='h-7 w-7 flex-shrink-0' onClick={() => setExpanded(true)}>
          <ChevronUp className='h-3.5 w-3.5' />
        </Button>
      </div>

      <div className='flex items-center gap-1'>
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
        <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>{formatTime(currentTime)}</span>
        <div className='flex-1'>
          <Waveform url={getSongAudioUrl(currentSong.id)} currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>
        <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

'use client'

import { ChevronDown, ChevronUp, MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { Waveform } from '@/components/waveform'
import { usePlayer } from '@/contexts/player-context'
import { getSongAudioUrl, getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { cn } from '@/lib/utils'

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

  return (
    <div className={cn('space-y-2', expanded ? 'p-4 space-y-3' : 'p-3')}>
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
          <p className='text-sm font-medium truncate'>{currentSong.title || currentSong.fileName}</p>
          {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={cn('flex-shrink-0', expanded ? 'h-6 w-6' : 'h-7 w-7')}
          onClick={() => setExpanded(!expanded)}>
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
        <p className='text-sm font-medium truncate'>{currentSong.title || currentSong.fileName}</p>
        {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        {currentSong.album && <p className='text-xs text-muted-foreground/70 truncate'>{currentSong.album}</p>}
      </div>

      <div className={cn('flex items-center', expanded ? 'flex-col gap-3' : 'gap-1')}>
        <div className={cn('flex items-center', expanded ? 'justify-center gap-2' : 'gap-0.5')}>
          <Button
            variant='ghost'
            size='icon'
            className={cn(expanded ? 'h-9 w-9' : 'h-7 w-7')}
            onClick={playPrevious}
            disabled={!hasPrevious}>
            <SkipBack className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={cn(expanded ? 'h-10 w-10' : 'h-7 w-7')}
            onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className={cn(expanded ? 'h-5 w-5' : 'h-3.5 w-3.5')} />
            ) : (
              <Play className={cn(expanded ? 'h-5 w-5' : 'h-3.5 w-3.5')} />
            )}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={cn(expanded ? 'h-9 w-9' : 'h-7 w-7')}
            onClick={playNext}
            disabled={!hasNext}>
            <SkipForward className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
          </Button>
        </div>

        <div className={cn('flex items-center gap-2', expanded ? 'w-full' : 'flex-1')}>
          <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>
            {formatTime(currentTime)}
          </span>
          <Waveform url={getSongAudioUrl(currentSong.id)} currentTime={currentTime} duration={duration} onSeek={seek} />
          <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

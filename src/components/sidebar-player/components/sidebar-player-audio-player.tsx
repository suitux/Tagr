'use client'

import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Waveform } from '@/components/waveform'
import { cn } from '@/lib/utils'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface SidebarPlayerAudioPlayerProps {
  songId: number
  expanded: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  hasPrevious: boolean
  hasNext: boolean
  onTogglePlayPause: () => void
  onPlayPrevious: () => void
  onPlayNext: () => void
  onSeek: (time: number) => void
}

export function SidebarPlayerAudioPlayer({
  songId,
  expanded,
  isPlaying,
  currentTime,
  duration,
  hasPrevious,
  hasNext,
  onTogglePlayPause,
  onPlayPrevious,
  onPlayNext,
  onSeek
}: SidebarPlayerAudioPlayerProps) {
  return (
    <div className={cn('flex items-center', expanded ? 'flex-col gap-3' : 'gap-1')}>
      <div className={cn('flex items-center', expanded ? 'justify-center gap-2' : 'gap-0.5')}>
        <Button
          variant='ghost'
          size='icon'
          className={cn(expanded ? 'h-9 w-9' : 'h-7 w-7')}
          onClick={onPlayPrevious}
          disabled={!hasPrevious}>
          <SkipBack className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className={cn(expanded ? 'h-10 w-10' : 'h-7 w-7')}
          onClick={onTogglePlayPause}>
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
          onClick={onPlayNext}
          disabled={!hasNext}>
          <SkipForward className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
        </Button>
      </div>

      <div className={cn('flex items-center gap-2', expanded ? 'w-full' : 'flex-1')}>
        <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>
          {formatTime(currentTime)}
        </span>
        <Waveform url={getSongAudioUrl(songId)} currentTime={currentTime} duration={duration} onSeek={onSeek} />
        <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

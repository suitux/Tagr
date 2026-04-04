'use client'

import { Loader2, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Waveform } from '@/components/waveform/waveform'
import { useMediaSession } from '@/features/player/hooks/use-media-session'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface SidebarPlayerAudioPlayerProps {
  expanded: boolean
}

export function SidebarPlayerAudioPlayer({ expanded }: SidebarPlayerAudioPlayerProps) {
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const isBuffering = usePlayerStore(s => s.isBuffering)
  const isAdjacentLoading = usePlayerStore(s => s.isAdjacentLoading)
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const _previousSong = usePlayerStore(s => s._previousSong)
  const _nextSong = usePlayerStore(s => s._nextSong)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const playPrevious = usePlayerStore(s => s.playPrevious)
  const playNext = usePlayerStore(s => s.playNext)
  const seek = usePlayerStore(s => s.seek)
  const currentSong = usePlayerStore(s => s.currentSong)
  useMediaSession({ currentSong, playPrevious, playNext, togglePlayPause })

  const hasPrevious = _previousSong !== null
  const hasNext = _nextSong !== null

  // Sticky: once the song starts playing, keep waveform mounted. Reset on song change.
  const waveformReady = useRef(false)
  const lastSongId = useRef<number | null>(null)
  if (currentSong && currentSong.id !== lastSongId.current) {
    lastSongId.current = currentSong.id
    waveformReady.current = false
  }
  if (isPlaying && !isBuffering) {
    waveformReady.current = true
  }

  if (!currentSong) return null

  return (
    <div className={cn('flex items-center', expanded ? 'flex-col gap-3' : 'gap-1')}>
      <div className={cn('flex items-center', expanded ? 'justify-center gap-2' : 'gap-0.5')}>
        <Button
          variant='ghost'
          size='icon'
          className={cn(expanded ? 'h-9 w-9' : 'h-7 w-7')}
          onClick={playPrevious}
          disabled={!hasPrevious || isAdjacentLoading}>
          <SkipBack className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className={cn('relative', expanded ? 'h-10 w-10' : 'h-7 w-7')}
          onClick={togglePlayPause}>
          {isPlaying ? (
            <Pause className={cn(expanded ? 'h-5 w-5' : 'h-3.5 w-3.5')} />
          ) : (
            <Play className={cn(expanded ? 'h-5 w-5' : 'h-3.5 w-3.5')} />
          )}
          {isBuffering && (
            <Loader2
              className={cn('absolute animate-spin text-muted-foreground', expanded ? 'h-12 w-12' : 'h-8 w-8')}
            />
          )}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className={cn(expanded ? 'h-9 w-9' : 'h-7 w-7')}
          onClick={playNext}
          disabled={!hasNext || isAdjacentLoading}>
          <SkipForward className={cn(expanded ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
        </Button>
      </div>

      <div className={cn('flex items-center gap-2', expanded ? 'w-full' : 'flex-1')}>
        <Waveform
          showTime
          url={getSongAudioUrl(currentSong.id)}
          readyToLoadWaveform={isPlaying && !isBuffering}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>
    </div>
  )
}

'use client'

import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Waveform } from '@/components/waveform/waveform'
import { useMediaSession } from '@/features/player/hooks/use-media-session'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'
import { formatTimeSeconds } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface SidebarPlayerAudioPlayerProps {
  expanded: boolean
}

export function SidebarPlayerAudioPlayer({ expanded }: SidebarPlayerAudioPlayerProps) {
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const _previousSong = usePlayerStore(s => s._previousSong)
  const _nextSong = usePlayerStore(s => s._nextSong)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const playPrevious = usePlayerStore(s => s.playPrevious)
  const playNext = usePlayerStore(s => s.playNext)
  const seek = usePlayerStore(s => s.seek)
  const currentSong = usePlayerStore(s => s.currentSong)
  const setAdjacentSongs = usePlayerStore(s => s.setAdjacentSongs)
  const queueFolder = usePlayerStore(s => s.queueFolder)
  const queueSearch = usePlayerStore(s => s.queueSearch)
  const queueSorting = usePlayerStore(s => s.queueSorting)
  const queueFilters = usePlayerStore(s => s.queueFilters)
  useMediaSession({ currentSong, playPrevious, playNext, togglePlayPause })

  const { data } = useAdjacentSongs(currentSong?.id ?? null, queueFolder, queueSearch, queueSorting, queueFilters)

  useEffect(() => {
    setAdjacentSongs(data?.previous ?? null, data?.next ?? null)
  }, [data, setAdjacentSongs])

  const hasPrevious = _previousSong !== null
  const hasNext = _nextSong !== null

  if (!currentSong) return null

  return (
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
        <Waveform
          showTime
          url={getSongAudioUrl(currentSong.id)}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>
    </div>
  )
}

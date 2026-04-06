'use client'

import { PlayButton } from '@/components/play-button'
import { SkipButton } from '@/components/skip-button'
import { Waveform } from '@/components/waveform/waveform'
import { useMediaSession } from '@/features/player/hooks/use-media-session'
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

  if (!currentSong) return null

  const buttonSize = expanded ? 'md' : 'sm'

  return (
    <div className={cn('flex items-center', expanded ? 'flex-col gap-3' : 'gap-1')}>
      <div className={cn('flex items-center', expanded ? 'justify-center gap-2' : 'gap-0.5')}>
        <SkipButton
          direction='back'
          size={buttonSize}
          onSkip={playPrevious}
          disabled={!hasPrevious || isAdjacentLoading}
        />
        <PlayButton isPlaying={isPlaying} isBuffering={isBuffering} onToggle={togglePlayPause} size={buttonSize} />
        <SkipButton direction='forward' size={buttonSize} onSkip={playNext} disabled={!hasNext || isAdjacentLoading} />
      </div>

      <div className={cn('flex items-center gap-2', expanded ? 'w-full' : 'flex-1')}>
        <Waveform
          showTime
          songId={currentSong.id}
          currentTime={currentTime}
          duration={currentSong.duration ?? 0}
          onSeek={seek}
        />
      </div>
    </div>
  )
}

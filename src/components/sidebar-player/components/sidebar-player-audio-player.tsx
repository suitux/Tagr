'use client'

import { RepeatIcon, ShuffleIcon } from 'lucide-react'
import { PlayButton } from '@/components/play-button'
import { SkipButton } from '@/components/skip-button'
import { Button } from '@/components/ui/button'
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
  const shuffle = usePlayerStore(s => s.shuffle)
  const toggleShuffle = usePlayerStore(s => s.toggleShuffle)
  const repeat = usePlayerStore(s => s.repeat)
  const toggleRepeat = usePlayerStore(s => s.toggleRepeat)
  useMediaSession({ currentSong, playPrevious, playNext, togglePlayPause })

  const hasPrevious = _previousSong !== null
  const hasNext = _nextSong !== null

  if (!currentSong) return null

  const buttonSize = expanded ? 'md' : 'sm'

  return (
    <div className={cn('flex items-center', expanded ? 'flex-col gap-3' : 'gap-1')}>
      <div className={cn('flex items-center', expanded ? 'justify-center gap-2' : 'gap-0.5')}>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'h-6 w-6 text-muted-foreground/70 hover:text-foreground',
            repeat && 'text-primary hover:text-primary'
          )}
          onClick={toggleRepeat}
          aria-pressed={repeat}>
          <RepeatIcon className='h-3 w-3' />
        </Button>
        <SkipButton
          direction='back'
          size={buttonSize}
          onSkip={playPrevious}
          disabled={!hasPrevious || isAdjacentLoading}
        />
        <PlayButton isPlaying={isPlaying} isBuffering={isBuffering} onToggle={togglePlayPause} size={buttonSize} />
        <SkipButton direction='forward' size={buttonSize} onSkip={playNext} disabled={!hasNext || isAdjacentLoading} />
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'h-6 w-6 text-muted-foreground/70 hover:text-foreground',
            shuffle && 'text-primary hover:text-primary'
          )}
          onClick={toggleShuffle}
          aria-pressed={shuffle}>
          <ShuffleIcon className='h-3 w-3' />
        </Button>
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

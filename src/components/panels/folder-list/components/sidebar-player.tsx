'use client'

import { MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { usePlayer } from '@/contexts/player-context'
import { getSongAudioUrl, getSongPictureUrl } from '@/features/songs/song-file-helpers'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SidebarPlayer() {
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

  const waveformRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const durationRef = useRef(duration)

  useEffect(() => {
    durationRef.current = duration
  }, [duration])

  // Create/destroy wavesurfer when song changes
  useEffect(() => {
    if (!waveformRef.current || !currentSong) return

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      height: 24,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      waveColor: 'white',
      progressColor: 'var(--color-primary)',
      interact: true,
      url: getSongAudioUrl(currentSong.id)
    })

    // Mute wavesurfer's internal audio — we only use it for the waveform visual
    ws.setVolume(0)

    // Forward click-to-seek to the real player
    ws.on('click', (relativeX: number) => {
      seek(relativeX * durationRef.current)
    })

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [currentSong, seek])

  // Sync visual progress from the real audio
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || duration <= 0) return
    const progress = Math.min(1, Math.max(0, currentTime / duration))
    ws.seekTo(progress)
  }, [currentTime, duration])

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id)

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

      <div className='flex items-center gap-2'>
        <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>{formatTime(currentTime)}</span>
        <div ref={waveformRef} className='flex-1 cursor-pointer' />
        <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

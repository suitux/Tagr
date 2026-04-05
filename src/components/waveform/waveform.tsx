'use client'

import WaveSurfer from 'wavesurfer.js'
import { RefObject, useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { useSongPeaks } from '@/features/songs/hooks/use-song-peaks'
import { formatTimeSeconds } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface WaveformBaseProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  showTime?: boolean
  disabled?: boolean
}

interface WaveformWithPeaks extends WaveformBaseProps {
  songId: number
  url?: never
  audioRef?: never
}

interface WaveformWithUrl extends WaveformBaseProps {
  url: string
  songId?: never
  audioRef?: RefObject<HTMLAudioElement | null>
}

type WaveformProps = WaveformWithPeaks | WaveformWithUrl

export function Waveform(props: WaveformProps) {
  const { currentTime, duration, onSeek, showTime = false, disabled = false } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const onSeekRef = useRef(onSeek)
  const [loading, setLoading] = useState(true)

  const songId = 'songId' in props ? props.songId : undefined
  const url = 'url' in props ? props.url : undefined
  const audioRef = 'audioRef' in props ? props.audioRef : undefined

  const { data: peaks } = useSongPeaks(songId)

  useEffect(() => {
    onSeekRef.current = onSeek
  })

  // Create WaveSurfer — either from peaks or from url
  useEffect(() => {
    if (!containerRef.current) return
    // If using peaks mode, wait until peaks are loaded
    if (songId !== undefined && !peaks) return

    const container = containerRef.current
    const styles = getComputedStyle(container)
    const primaryColor = styles.getPropertyValue('--primary').trim()
    const mutedFg = styles.getPropertyValue('--muted-foreground').trim()

    const ws = WaveSurfer.create({
      container,
      height: 24,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      waveColor: mutedFg,
      progressColor: primaryColor,
      interact: true,
      dragToSeek: true,
      ...(peaks
        ? { peaks: [peaks], duration }
        : { url: url! })
    })

    if (!peaks) {
      ws.setVolume(0)
    }

    ws.on('ready', () => setLoading(false))
    ws.on('interaction', (newTime: number) => {
      onSeekRef.current(newTime)
    })

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
      setLoading(true)
    }
  }, [url, songId, peaks, duration])

  // Sync visual progress
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || duration <= 0) return
    const progress = Math.min(1, Math.max(0, currentTime / duration))
    ws.seekTo(progress)
  }, [currentTime, duration])

  const isLoading = songId !== undefined ? loading && !peaks : loading

  return (
    <div className='flex items-center gap-2 flex-1'>
      {audioRef && url && <audio ref={audioRef} preload='metadata' src={url} />}
      {showTime && (
        <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>
          {formatTimeSeconds(currentTime)}
        </span>
      )}
      <div className='relative flex-1'>
        {isLoading && (
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={0.1}
            disabled={disabled}
            onValueChange={([value]) => onSeek((value / 100) * duration)}
            className='absolute inset-0 z-10'
          />
        )}
        <div
          ref={containerRef}
          className={cn(isLoading ? 'invisible' : 'cursor-pointer', disabled && 'pointer-events-none opacity-50')}
        />
      </div>
      {showTime && (
        <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTimeSeconds(duration)}</span>
      )}
    </div>
  )
}

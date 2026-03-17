'use client'

import WaveSurfer from 'wavesurfer.js'
import { RefObject, useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { formatTimeSeconds } from '@/lib/formatters'

interface WaveformProps {
  url: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  showTime?: boolean
  audioRef?: RefObject<HTMLAudioElement | null>
}

export function Waveform({ url, currentTime, duration, onSeek, showTime = false, audioRef }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const onSeekRef = useRef(onSeek)
  const [loading, setLoading] = useState(true)

  // Create/destroy wavesurfer when url changes
  useEffect(() => {
    if (!containerRef.current) return

    const styles = getComputedStyle(containerRef.current)
    const primaryColor = styles.getPropertyValue('--primary').trim()
    const mutedFg = styles.getPropertyValue('--muted-foreground').trim()

    setLoading(true)

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 24,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      waveColor: mutedFg,
      progressColor: primaryColor,
      interact: true,
      dragToSeek: true,
      url
    })

    // Mute wavesurfer's internal audio — we only use it for the waveform visual
    ws.setVolume(0)

    ws.on('ready', () => setLoading(false))

    // Forward click/drag-to-seek to the real player
    ws.on('interaction', (newTime: number) => {
      onSeekRef.current(newTime)
    })

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [url])

  // Sync visual progress
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || duration <= 0) return
    const progress = Math.min(1, Math.max(0, currentTime / duration))
    ws.seekTo(progress)
  }, [currentTime, duration])

  return (
    <div className='flex items-center gap-2 flex-1'>
      {audioRef && <audio ref={audioRef} preload='metadata' src={url} />}
      {showTime && (
        <span className='text-[10px] text-muted-foreground tabular-nums w-8 text-right'>
          {formatTimeSeconds(currentTime)}
        </span>
      )}
      <div className='relative flex-1'>
        {loading && (
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={0.1}
            onValueChange={([value]) => onSeek((value / 100) * duration)}
            className='absolute inset-0 z-10'
          />
        )}
        <div ref={containerRef} className={loading ? 'invisible' : 'cursor-pointer'} />
      </div>
      {showTime && (
        <span className='text-[10px] text-muted-foreground tabular-nums w-8'>{formatTimeSeconds(duration)}</span>
      )}
    </div>
  )
}

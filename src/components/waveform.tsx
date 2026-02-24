'use client'

import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface WaveformProps {
  url: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export function Waveform({ url, currentTime, duration, onSeek }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const durationRef = useRef(duration)
  const onSeekRef = useRef(onSeek)

  useEffect(() => {
    durationRef.current = duration
  }, [duration])

  useEffect(() => {
    onSeekRef.current = onSeek
  }, [onSeek])

  // Create/destroy wavesurfer when url changes
  useEffect(() => {
    if (!containerRef.current) return

    const styles = getComputedStyle(containerRef.current)
    const primaryColor = styles.getPropertyValue('--primary').trim()
    const mutedFg = styles.getPropertyValue('--muted-foreground').trim()

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
      url
    })

    // Mute wavesurfer's internal audio — we only use it for the waveform visual
    ws.setVolume(0)

    // Forward click-to-seek to the real player
    ws.on('click', (relativeX: number) => {
      onSeekRef.current(relativeX * durationRef.current)
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

  return <div ref={containerRef} className='flex-1 cursor-pointer' />
}

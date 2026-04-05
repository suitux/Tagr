'use client'

import { Waveform } from '@/components/waveform/waveform'
import { usePlayerStore } from '@/stores/player-store'

interface ExpandedPlayerWaveformProps {
  songId: number
}

export function ExpandedPlayerWaveform({ songId }: ExpandedPlayerWaveformProps) {
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const seek = usePlayerStore(s => s.seek)

  return (
    <Waveform
      showTime
      songId={songId}
      currentTime={currentTime}
      duration={duration}
      onSeek={seek}
    />
  )
}

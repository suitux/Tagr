'use client'

import { Waveform } from '@/components/waveform/waveform'
import { usePlayerStore } from '@/stores/player-store'

interface ExpandedPlayerWaveformProps {
  songId: number
}

export function ExpandedPlayerWaveform({ songId }: ExpandedPlayerWaveformProps) {
  const currentTime = usePlayerStore(s => s.currentTime)
  const currentSong = usePlayerStore(s => s.currentSong)
  const seek = usePlayerStore(s => s.seek)

  return (
    <Waveform showTime songId={songId} currentTime={currentTime} duration={currentSong?.duration ?? 0} onSeek={seek} />
  )
}

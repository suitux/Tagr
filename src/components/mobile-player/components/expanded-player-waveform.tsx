'use client'

import { Waveform } from '@/components/waveform/waveform'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'
import { usePlayerStore } from '@/stores/player-store'

interface ExpandedPlayerWaveformProps {
  songId: number
}

export function ExpandedPlayerWaveform({ songId }: ExpandedPlayerWaveformProps) {
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const seek = usePlayerStore(s => s.seek)
  const hasStartedPlaying = usePlayerStore(s => s.hasStartedPlaying)

  return (
    <Waveform
      showTime
      url={getSongAudioUrl(songId)}
      readyToLoadWaveform={hasStartedPlaying}
      currentTime={currentTime}
      duration={duration}
      onSeek={seek}
    />
  )
}

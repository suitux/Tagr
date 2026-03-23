'use client'

import { useState } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { ExpandedPlayer } from './components/expanded-player'
import { MiniPlayer } from './components/mini-player'

export function MobilePlayer() {
  const currentSong = usePlayerStore(s => s.currentSong)
  const [expanded, setExpanded] = useState(false)

  if (!currentSong) return null

  return (
    <>
      <ExpandedPlayer song={currentSong} expanded={expanded} onCollapse={() => setExpanded(false)} />
      <MiniPlayer song={currentSong} expanded={expanded} onExpand={() => setExpanded(true)} />
    </>
  )
}

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarPlayerAudioPlayer } from './components/sidebar-player-audio-player'
import { SidebarPlayerImage } from './components/sidebar-player-image'

export function SidebarPlayer() {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={cn('space-y-2', expanded ? 'p-4 space-y-3' : 'p-3')}>
      <SidebarPlayerImage expanded={expanded} onToggleExpanded={() => setExpanded(!expanded)} />
      <SidebarPlayerAudioPlayer expanded={expanded} />
    </div>
  )
}

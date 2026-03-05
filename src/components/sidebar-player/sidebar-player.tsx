'use client'

import { useEffect, useState } from 'react'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'
import { SidebarPlayerAudioPlayer } from './components/sidebar-player-audio-player'
import { SidebarPlayerImage } from './components/sidebar-player-image'

export function SidebarPlayer() {
  const [expanded, setExpanded] = useState(true)

  const currentSong = usePlayerStore(s => s.currentSong)
  const queueFolder = usePlayerStore(s => s.queueFolder)
  const queueSearch = usePlayerStore(s => s.queueSearch)
  const queueSorting = usePlayerStore(s => s.queueSorting)
  const queueFilters = usePlayerStore(s => s.queueFilters)
  const setAdjacentSongs = usePlayerStore(s => s.setAdjacentSongs)

  const { data } = useAdjacentSongs(currentSong?.id ?? null, queueFolder, queueSearch, queueSorting, queueFilters)

  useEffect(() => {
    setAdjacentSongs(data?.previous ?? null, data?.next ?? null)
  }, [data, setAdjacentSongs])

  if (!currentSong) return null

  return (
    <div className={cn('space-y-2', expanded ? 'p-4 space-y-3' : 'p-3')}>
      <SidebarPlayerImage expanded={expanded} onToggleExpanded={() => setExpanded(!expanded)} />
      <SidebarPlayerAudioPlayer songId={currentSong.id} expanded={expanded} />
    </div>
  )
}

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

export function useSelectedSong() {
  const [selectedSongId, setSelectedSongId] = useQueryState('song', parseAsInteger)
  const setDetailSheetOpen = useMobileNavStore(s => s.setDetailSheetOpen)

  const _setSelectedSongId = (songId: number | null) => {
    setSelectedSongId(songId)

    if (songId === null) {
      setDetailSheetOpen(false)
    }
  }

  return { selectedSongId, setSelectedSongId: _setSelectedSongId }
}

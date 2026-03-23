'use client'

import { parseAsInteger, useQueryState } from 'nuqs'

export function useSelectedSong() {
  const [selectedSongId, setSelectedSongId] = useQueryState('song', {
    parse: parseAsInteger.parse,
    history: 'push'
  })

  return { selectedSongId, setSelectedSongId, isSongSelected: selectedSongId !== null }
}

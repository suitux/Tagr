'use client'

import { parseAsInteger, useQueryState } from 'nuqs'

export function useSelectedSong() {
  const [selectedSongId, setSelectedSongId] = useQueryState('song', parseAsInteger)

  return { selectedSongId, setSelectedSongId }
}

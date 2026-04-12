'use client'

import { parseAsInteger, useQueryState } from 'nuqs'

export function useSelectedPlaylist() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useQueryState(
    'playlist',
    parseAsInteger.withOptions({ history: 'replace' })
  )
  return { selectedPlaylistId, setSelectedPlaylistId }
}

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'

export function useSelectedCustomPlaylist() {
  const [selectedCustomPlaylistId, setSelectedCustomPlaylistId] = useQueryState(
    'customPlaylist',
    parseAsInteger.withOptions({ history: 'replace' })
  )
  return { selectedCustomPlaylistId, setSelectedCustomPlaylistId }
}

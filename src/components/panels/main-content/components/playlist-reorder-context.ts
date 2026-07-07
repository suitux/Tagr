'use client'

import { createContext, useContext } from 'react'

export interface PlaylistReorderState {
  /** Whether reorder is currently possible (owner, manual order, no sort/search/filter). */
  canReorder: boolean
  /** Whether reorder mode is enabled (drag handles shown). */
  isReordering: boolean
  setIsReordering: (value: boolean) => void
}

export const PlaylistReorderContext = createContext<PlaylistReorderState | null>(null)

export function usePlaylistReorder() {
  return useContext(PlaylistReorderContext)
}

'use client'

import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'

const ReadOnlySongContext = createContext(false)

/**
 * Wraps the detail of a song that must not be touched whoever is looking at it — one sitting in the
 * trash. Everything below then renders as it does for a listener, and playback and sharing go too.
 */
export const ReadOnlySongProvider = ReadOnlySongContext.Provider

export function useIsSongReadOnly(): boolean {
  return useContext(ReadOnlySongContext)
}

/** Whether the current user may change the song being shown: a tagger, and the song not read-only. */
export function useCanEditSong(): boolean {
  const { data: session } = useSession()
  const readOnly = useIsSongReadOnly()

  return !readOnly && hasMinimumRole(session?.user?.role as UserRole, 'tagger')
}

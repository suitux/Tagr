'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

export function smartPlaylistHref(playlistId: number): string {
  return `/smart-playlists/${playlistId}`
}

export function useSelectedPlaylist() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()

  const numericId = Number(params.id)
  const selectedPlaylistId =
    pathname.startsWith('/smart-playlists/') && !Number.isNaN(numericId) ? numericId : null

  const setSelectedPlaylistId = useCallback(
    (playlistId: number | null) => {
      router.push(playlistId === null ? `/folders/${ALL_SONGS_FOLDER_ID}` : smartPlaylistHref(playlistId))
    },
    [router]
  )

  return { selectedPlaylistId, setSelectedPlaylistId }
}

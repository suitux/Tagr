'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

export function playlistHref(playlistId: number): string {
  return `/playlists/${playlistId}`
}

export function useSelectedCustomPlaylist() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()

  const numericId = Number(params.id)
  const selectedCustomPlaylistId =
    pathname.startsWith('/playlists/') && !Number.isNaN(numericId) ? numericId : null

  const setSelectedCustomPlaylistId = useCallback(
    (playlistId: number | null) => {
      router.push(playlistId === null ? `/folders/${ALL_SONGS_FOLDER_ID}` : playlistHref(playlistId))
    },
    [router]
  )

  return { selectedCustomPlaylistId, setSelectedCustomPlaylistId }
}

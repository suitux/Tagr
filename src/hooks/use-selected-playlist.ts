'use client'

import { useParams, usePathname } from 'next/navigation'

export function useSelectedPlaylist() {
  const pathname = usePathname()
  const params = useParams<{ id?: string }>()

  const isPlaylistRoute = pathname.startsWith('/smart-playlists/')
  const parsed = params.id ? Number.parseInt(params.id, 10) : NaN
  const selectedPlaylistId = isPlaylistRoute && Number.isFinite(parsed) ? parsed : null

  return { selectedPlaylistId }
}

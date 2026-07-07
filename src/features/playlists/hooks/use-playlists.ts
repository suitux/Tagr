'use client'

import type { Playlist, PlaylistListResponse } from '@/features/playlists/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface ErrorResponse {
  success: false
  error: string
}

type Response = PlaylistListResponse | ErrorResponse

export interface PlaylistsResult {
  private: Playlist[]
  public: Playlist[]
}

async function fetchPlaylists(): Promise<PlaylistsResult> {
  const { data } = await api.get<Response>('/playlists')
  if (!data.success) throw new Error(data.error)
  return { private: data.private, public: data.public }
}

export const getPlaylistsQueryKey = () => ['playlists'] as const

export function usePlaylists() {
  return useQuery({
    queryKey: getPlaylistsQueryKey(),
    queryFn: fetchPlaylists
  })
}

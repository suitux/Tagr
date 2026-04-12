'use client'

import type { SmartPlaylist, SmartPlaylistListResponse } from '@/features/smart-playlists/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface ErrorResponse {
  success: false
  error: string
}

type Response = SmartPlaylistListResponse | ErrorResponse

export interface SmartPlaylistsResult {
  private: SmartPlaylist[]
  public: SmartPlaylist[]
}

async function fetchSmartPlaylists(): Promise<SmartPlaylistsResult> {
  const { data } = await api.get<Response>('/smart-playlists')
  if (!data.success) throw new Error(data.error)
  return { private: data.private, public: data.public }
}

export const getSmartPlaylistsQueryKey = () => ['smart-playlists'] as const

export function useSmartPlaylists() {
  return useQuery({
    queryKey: getSmartPlaylistsQueryKey(),
    queryFn: fetchSmartPlaylists
  })
}

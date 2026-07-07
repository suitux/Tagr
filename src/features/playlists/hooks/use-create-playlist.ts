'use client'

import type { Playlist } from '@/features/playlists/domain'
import { getPlaylistsQueryKey } from '@/features/playlists/hooks/use-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateParams {
  name: string
  isPublic: boolean
}

interface SuccessResponse {
  success: true
  playlist: Playlist
}

interface ErrorResponse {
  success: false
  error: string
}

async function createPlaylist(params: CreateParams): Promise<Playlist> {
  const { data } = await api.post<SuccessResponse | ErrorResponse>('/playlists', params)
  if (!data.success) throw new Error(data.error)
  return data.playlist
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPlaylistsQueryKey() })
    }
  })
}

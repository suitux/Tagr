'use client'

import type { Playlist } from '@/features/playlists/domain'
import { getPlaylistsQueryKey } from '@/features/playlists/hooks/use-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateParams {
  id: number
  name?: string
  isPublic?: boolean
}

interface SuccessResponse {
  success: true
  playlist: Playlist
}

interface ErrorResponse {
  success: false
  error: string
}

async function updatePlaylist({ id, ...body }: UpdateParams): Promise<Playlist> {
  const { data } = await api.patch<SuccessResponse | ErrorResponse>(`/playlists/${id}`, body)
  if (!data.success) throw new Error(data.error)
  return data.playlist
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPlaylistsQueryKey() })
    }
  })
}

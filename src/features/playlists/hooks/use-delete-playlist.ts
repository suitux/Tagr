'use client'

import { getPlaylistsQueryKey } from '@/features/playlists/hooks/use-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface SuccessResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

async function deletePlaylist(id: number): Promise<void> {
  const { data } = await api.delete<SuccessResponse | ErrorResponse>(`/playlists/${id}`)
  if (!data.success) throw new Error(data.error)
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPlaylistsQueryKey() })
    }
  })
}

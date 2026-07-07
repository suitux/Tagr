'use client'

import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ReorderParams {
  playlistId: number
  orderedSongIds: number[]
}

interface SuccessResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

async function reorderPlaylistItems({ playlistId, orderedSongIds }: ReorderParams): Promise<void> {
  const { data } = await api.patch<SuccessResponse | ErrorResponse>(`/playlists/${playlistId}/reorder`, {
    orderedSongIds
  })
  if (!data.success) throw new Error(data.error)
}

export function useReorderPlaylistItems() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderPlaylistItems,
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === 'playlists' && queryKey[1] === playlistId && queryKey[2] === 'songs'
      })
    }
  })
}

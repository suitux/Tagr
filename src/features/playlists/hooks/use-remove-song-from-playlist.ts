'use client'

import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RemoveParams {
  playlistId: number
  songId: number
}

interface SuccessResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

async function removeSongFromPlaylist({ playlistId, songId }: RemoveParams): Promise<void> {
  const { data } = await api.delete<SuccessResponse | ErrorResponse>(`/playlists/${playlistId}/songs/${songId}`)
  if (!data.success) throw new Error(data.error)
}

export function useRemoveSongFromPlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeSongFromPlaylist,
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === 'playlists' && queryKey[1] === playlistId && queryKey[2] === 'songs'
      })
    }
  })
}

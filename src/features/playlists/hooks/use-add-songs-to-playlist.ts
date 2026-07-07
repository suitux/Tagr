'use client'

import { type BulkTarget } from '@/features/songs/bulk-target'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface AddParams {
  playlistId: number
  target: BulkTarget
}

interface SuccessResponse {
  success: true
  added: number
}

interface ErrorResponse {
  success: false
  error: string
}

async function addSongsToPlaylist({ playlistId, target }: AddParams): Promise<number> {
  const { data } = await api.post<SuccessResponse | ErrorResponse>(`/playlists/${playlistId}/songs`, { target })
  if (!data.success) throw new Error(data.error)
  return data.added
}

export function useAddSongsToPlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addSongsToPlaylist,
    onSuccess: (_added, { playlistId }) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === 'playlists' && queryKey[1] === playlistId && queryKey[2] === 'songs'
      })
    }
  })
}

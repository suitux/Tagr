'use client'

import { type BulkTarget } from '@/features/songs/bulk-target'
import { api } from '@/lib/axios'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RemoveParams {
  playlistId: number
  target: BulkTarget
}

interface SuccessResponse {
  success: true
  removed: number
}

interface ErrorResponse {
  success: false
  error: string
}

async function removeSongsFromPlaylist({ playlistId, target }: RemoveParams): Promise<number> {
  const { data } = await api.post<SuccessResponse | ErrorResponse>(`/playlists/${playlistId}/songs/remove`, { target })
  if (!data.success) throw new Error(data.error)
  return data.removed
}

export function useRemoveSongsFromPlaylist() {
  const queryClient = useQueryClient()
  const clearSelection = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: removeSongsFromPlaylist,
    onSuccess: (_removed, { playlistId }) => {
      clearSelection()
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === 'playlists' && queryKey[1] === playlistId && queryKey[2] === 'songs'
      })
    }
  })
}

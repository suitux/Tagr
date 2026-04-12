'use client'

import { getSmartPlaylistsQueryKey } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface SuccessResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

async function deleteSmartPlaylist(id: number): Promise<void> {
  const { data } = await api.delete<SuccessResponse | ErrorResponse>(`/smart-playlists/${id}`)
  if (!data.success) throw new Error(data.error)
}

export function useDeleteSmartPlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSmartPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSmartPlaylistsQueryKey() })
    }
  })
}

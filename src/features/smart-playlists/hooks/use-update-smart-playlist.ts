'use client'

import type { SmartPlaylist, SmartPlaylistRules } from '@/features/smart-playlists/domain'
import { getSmartPlaylistsQueryKey } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateParams {
  id: number
  name?: string
  rules?: SmartPlaylistRules
  isPublic?: boolean
}

interface SuccessResponse {
  success: true
  playlist: SmartPlaylist
}

interface ErrorResponse {
  success: false
  error: string
}

async function updateSmartPlaylist({ id, ...body }: UpdateParams): Promise<SmartPlaylist> {
  const { data } = await api.patch<SuccessResponse | ErrorResponse>(`/smart-playlists/${id}`, body)
  if (!data.success) throw new Error(data.error)
  return data.playlist
}

export function useUpdateSmartPlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSmartPlaylist,
    onSuccess: playlist => {
      queryClient.invalidateQueries({ queryKey: getSmartPlaylistsQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['smart-playlists', playlist.id, 'songs'] })
    }
  })
}

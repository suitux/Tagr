'use client'

import type { SmartPlaylist, SmartPlaylistRules } from '@/features/smart-playlists/domain'
import { getSmartPlaylistsQueryKey } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateParams {
  name: string
  rules: SmartPlaylistRules
  isPublic: boolean
}

interface SuccessResponse {
  success: true
  playlist: SmartPlaylist
}

interface ErrorResponse {
  success: false
  error: string
}

async function createSmartPlaylist(params: CreateParams): Promise<SmartPlaylist> {
  const { data } = await api.post<SuccessResponse | ErrorResponse>('/smart-playlists', params)
  if (!data.success) throw new Error(data.error)
  return data.playlist
}

export function useCreateSmartPlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSmartPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSmartPlaylistsQueryKey() })
    }
  })
}

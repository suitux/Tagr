'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Song } from '@/features/songs/domain'
import { api } from '@/lib/axios'

interface RevertResponse {
  success: true
  song: Song
}

interface RevertParams {
  songId: number
  historyId: number
}

export function useRevertChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ songId, historyId }: RevertParams) => {
      const { data } = await api.post<RevertResponse>(`/songs/${songId}/history/${historyId}/revert`)
      return data.song
    },
    onSuccess: updatedSong => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
      queryClient.setQueryData(['song', updatedSong.id], updatedSong)
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    }
  })
}

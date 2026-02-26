'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Song } from '@/features/songs/domain'

interface RevertResponse {
  success: true
  song: Song
}

interface RevertItem {
  songId: number
  historyId: number
}

export function useRevertChanges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: RevertItem[]) => {
      const results: Song[] = []
      for (const { songId, historyId } of items) {
        const { data } = await api.post<RevertResponse>(`/songs/${songId}/history/${historyId}/revert`)
        results.push(data.song)
      }
      return results
    },
    onSuccess: songs => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })
      for (const song of songs) {
        queryClient.setQueryData(['song', song.id], song)
      }
    }
  })
}

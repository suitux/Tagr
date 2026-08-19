'use client'

import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { Song } from '@/features/songs/domain'
import { applySongUpdates } from '@/features/songs/hooks/bulk-cache-sync'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
      invalidateAllHistoryQueryKeys(queryClient)
      applySongUpdates(queryClient, [updatedSong])
    }
  })
}

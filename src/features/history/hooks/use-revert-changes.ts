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
      invalidateAllHistoryQueryKeys(queryClient)
      applySongUpdates(queryClient, songs)
    }
  })
}

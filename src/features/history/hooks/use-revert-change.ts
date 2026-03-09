'use client'

import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { Song } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
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
      queryClient.setQueryData(getSongQueryKey(updatedSong.id), updatedSong)
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    }
  })
}

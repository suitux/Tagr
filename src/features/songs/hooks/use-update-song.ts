'use client'

import { incrementEditCount } from '@/components/star-prompt-dialog'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { SongWithMetadata } from '@/features/songs/domain'
import { applySongUpdates } from '@/features/songs/hooks/bulk-cache-sync'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateSongResponse {
  success: true
  song: SongWithMetadata
}

interface UpdateSongError {
  success: false
  error: string
}

type UpdateSongResult = UpdateSongResponse | UpdateSongError

interface UpdateSongParams {
  id: number
  metadata: Partial<SongMetadataUpdate>
}

async function updateSong({ id, metadata }: UpdateSongParams): Promise<SongWithMetadata> {
  const response = await api.patch<UpdateSongResult>(`/songs/${id}`, metadata)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

export function useUpdateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSong,
    onSuccess: updatedSong => {
      applySongUpdates(queryClient, [updatedSong])
      invalidateAllHistoryQueryKeys(queryClient)
      incrementEditCount()
    }
  })
}

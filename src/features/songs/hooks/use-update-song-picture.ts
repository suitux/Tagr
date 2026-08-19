'use client'

import axios from 'axios'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { Song } from '@/features/songs/domain'
import { applySongUpdates } from '@/features/songs/hooks/bulk-cache-sync'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdatePictureResponse {
  success: true
  song: Song
}

interface UpdatePictureError {
  success: false
  error: string
}

type UpdatePictureResult = UpdatePictureResponse | UpdatePictureError

interface UpdatePictureParams {
  songId: number
  file: File
}

async function updateSongPicture({ songId, file }: UpdatePictureParams): Promise<Song> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await axios.put<UpdatePictureResult>(`/api/songs/${songId}/picture`, formData)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

export function useUpdateSongPicture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSongPicture,
    onSuccess: updatedSong => {
      applySongUpdates(queryClient, [updatedSong])
      invalidateAllHistoryQueryKeys(queryClient)
    }
  })
}

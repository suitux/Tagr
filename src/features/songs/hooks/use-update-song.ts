'use client'

import { Song } from '@/features/songs/domain'
import { getUseSongsByFolderQueryKey, SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UpdateSongResponse {
  success: true
  song: Song
}

interface UpdateSongError {
  success: false
  error: string
}

type UpdateSongResult = UpdateSongResponse | UpdateSongError

interface UpdateSongParams {
  id: number
  metadata: Record<string, string | number | null>
}

async function updateSong({ id, metadata }: UpdateSongParams): Promise<Song> {
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
      queryClient.setQueriesData<SongsSuccessResponse>(
        { queryKey: getUseSongsByFolderQueryKey(updatedSong.folderPath) },
        oldData => {
          if (!oldData?.success) return oldData

          return {
            ...oldData,
            files: oldData.files.map(song => (song.id === updatedSong.id ? updatedSong : song))
          }
        }
      )

      // Update individual song cache
      queryClient.setQueryData(['song', updatedSong.id], updatedSong)
    }
  })
}

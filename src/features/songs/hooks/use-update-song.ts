'use client'

import { getHistoryQueryKey } from '@/features/history/hooks/use-history'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { Song } from '@/features/songs/domain'
import { getUseSongsByFolderQueryKey, SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

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
  metadata: Partial<SongMetadataUpdate>
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
      queryClient.setQueriesData<InfiniteData<SongsResponse, number>>(
        {
          predicate: ({ queryKey }) => {
            return queryKey[0] === 'songs' && queryKey[1] === 'folder'
          }
        },
        oldData => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map(page => {
              if (!page.success) return page
              return {
                ...page,
                files: page.files.map(song => (song.id === updatedSong.id ? updatedSong : song))
              }
            })
          }
        }
      )

      queryClient.setQueryData(['song', updatedSong.id], updatedSong)
      queryClient.invalidateQueries({ queryKey: getHistoryQueryKey() })
    }
  })
}

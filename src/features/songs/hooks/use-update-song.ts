'use client'

import { getHistoryQueryKey, invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { getUseSongsByFolderQueryKey, SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { incrementEditCount } from '@/components/star-prompt-dialog'
import { api } from '@/lib/axios'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

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

      queryClient.setQueryData(getSongQueryKey(updatedSong.id), updatedSong)
      invalidateAllHistoryQueryKeys(queryClient)
      incrementEditCount()
    }
  })
}

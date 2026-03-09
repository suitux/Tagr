'use client'

import axios from 'axios'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { Song } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

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

      invalidateAllHistoryQueryKeys(queryClient)
      queryClient.setQueryData(getSongQueryKey(updatedSong.id), updatedSong)
    }
  })
}

'use client'

import axios from 'axios'
import { Song } from '@/features/songs/domain'
import { SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { InfiniteData, UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'

interface FetchCoverResponse {
  success: true
  song: Song
}

interface FetchCoverError {
  success: false
  error: string
}

type FetchCoverResult = FetchCoverResponse | FetchCoverError

async function fetchMusicBrainzCover(songId: number): Promise<Song> {
  const response = await axios.post<FetchCoverResult>(`/api/songs/${songId}/musicbrainz-cover`)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

type Options = Pick<UseMutationOptions<Song, Error, number>, 'onSuccess' | 'onError'>

export function useFetchMusicBrainzCover(options?: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchMusicBrainzCover,
    onSuccess: (updatedSong, songId, onMutateResult, context) => {
      queryClient.setQueriesData<InfiniteData<SongsSuccessResponse, number>>(
        {
          predicate: ({ queryKey }) => queryKey[0] === 'songs' && queryKey[1] === 'folder'
        },
        oldData => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              files: page.files.map(song => (song.id === updatedSong.id ? updatedSong : song))
            }))
          }
        }
      )

      queryClient.setQueryData(['song', updatedSong.id], updatedSong)
      options?.onSuccess?.(updatedSong, songId, onMutateResult, context)
    },
    onError: (error, songId, onMutateResult, context) => {
      options?.onError?.(error, songId, onMutateResult, context)
    }
  })
}

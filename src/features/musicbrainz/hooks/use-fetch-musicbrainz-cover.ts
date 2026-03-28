'use client'

import axios from 'axios'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { Song } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
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

interface FetchCoverParams {
  songId: number
  releaseId?: string
}

async function fetchMusicBrainzCover({ songId, releaseId }: FetchCoverParams): Promise<Song> {
  const response = await axios.post<FetchCoverResult>(`/api/songs/${songId}/musicbrainz/fetch-cover`, releaseId ? { releaseId } : undefined)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

type Options = Pick<UseMutationOptions<Song, Error, FetchCoverParams>, 'onSuccess' | 'onError'>

export function useFetchMusicBrainzCover(options?: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchMusicBrainzCover,
    onSuccess: (updatedSong, params, onMutateResult, context) => {
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

      queryClient.setQueryData(getSongQueryKey(updatedSong.id), updatedSong)
      invalidateAllHistoryQueryKeys(queryClient)
      options?.onSuccess?.(updatedSong, params, onMutateResult, context)
    },
    onError: (error, params, onMutateResult, context) => {
      options?.onError?.(error, params, onMutateResult, context)
    }
  })
}

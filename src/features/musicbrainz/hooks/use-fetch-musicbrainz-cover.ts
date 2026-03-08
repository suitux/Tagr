'use client'

import { Song } from '@/features/songs/domain'
import { SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

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

export function useFetchMusicBrainzCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchMusicBrainzCover,
    onSuccess: updatedSong => {
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
    }
  })
}

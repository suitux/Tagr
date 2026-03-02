'use client'

import { Song } from '@/features/songs/domain'
import { getUseSongsByFolderQueryKey, SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

interface RescanSongResponse {
  success: true
  song: Song
}

interface RescanSongError {
  success: false
  error: string
}

type RescanSongResult = RescanSongResponse | RescanSongError

async function rescanSong(songId: number): Promise<Song> {
  const response = await api.post<RescanSongResult>(`/songs/${songId}/rescan`)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

export function useRescanSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rescanSong,
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
    }
  })
}

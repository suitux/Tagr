'use client'

import { Song } from '@/features/songs/domain'
import { applySongUpdates } from '@/features/songs/hooks/bulk-cache-sync'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
      applySongUpdates(queryClient, [updatedSong])
    }
  })
}

'use client'

import { Song } from '@/features/songs/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface GetSongSuccessResponse {
  success: true
  song: Song
}

interface GetSongErrorResponse {
  success: false
  error: string
}

type GetSongResponse = GetSongSuccessResponse | GetSongErrorResponse

async function fetchSong(id: number): Promise<Song> {
  const response = await api.get<GetSongResponse>(`/songs/${id}`)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.song
}

const getSongQueryKey = (id?: number) => ['song', id]

export function useSong(id: number | undefined) {
  return useQuery({
    queryKey: getSongQueryKey(id),
    queryFn: () => fetchSong(id!),
    enabled: id !== undefined
  })
}

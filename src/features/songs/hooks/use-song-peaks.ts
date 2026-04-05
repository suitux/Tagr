'use client'

import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface PeaksResponse {
  success: true
  peaks: number[]
  duration: number
}

async function fetchPeaks(songId: number): Promise<number[]> {
  const response = await api.get<PeaksResponse>(`/songs/${songId}/peaks`)
  return response.data.peaks
}

export function useSongPeaks(songId: number | undefined) {
  return useQuery({
    queryKey: ['song-peaks', songId],
    queryFn: () => fetchPeaks(songId!),
    enabled: songId !== undefined,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30
  })
}

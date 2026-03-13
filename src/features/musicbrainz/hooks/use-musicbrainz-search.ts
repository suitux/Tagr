'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { MusicBrainzRecording } from '@/features/musicbrainz/domain'

interface SearchResponse {
  success: true
  recordings: MusicBrainzRecording[]
}

async function searchRecordings(title: string, album: string): Promise<MusicBrainzRecording[]> {
  const response = await api.get<SearchResponse>('/musicbrainz/search', {
    params: { title, album }
  })

  if (!response.data.success) {
    throw new Error('Search failed')
  }

  return response.data.recordings
}

export function useMusicBrainzSearch(title: string, album: string) {
  return useQuery({
    queryKey: ['musicbrainz', 'search', title, album],
    queryFn: () => searchRecordings(title, album),
    enabled: !!(title || album)
  })
}

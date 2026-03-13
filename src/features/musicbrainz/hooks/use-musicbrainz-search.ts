'use client'

import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { MusicBrainzRecording } from '@/features/musicbrainz/domain'

interface SearchParams {
  title: string
  album: string
}

interface SearchResponse {
  success: true
  recordings: MusicBrainzRecording[]
}

async function searchRecordings({ title, album }: SearchParams): Promise<MusicBrainzRecording[]> {
  const response = await api.get<SearchResponse>('/musicbrainz/search', {
    params: { title, album }
  })

  if (!response.data.success) {
    throw new Error('Search failed')
  }

  return response.data.recordings
}

export function useMusicBrainzSearch() {
  return useMutation({
    mutationFn: searchRecordings
  })
}

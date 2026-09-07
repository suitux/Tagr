'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import {
  MUSICBRAINZ_SEARCH_PAGE_SIZE,
  type MusicBrainzRecording,
  type MusicBrainzSearchParams
} from '@/features/musicbrainz/domain'

interface SearchResponse {
  success: true
  recordings: MusicBrainzRecording[]
  count: number
  offset: number
}

async function searchRecordings(params: MusicBrainzSearchParams, offset: number): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>('/musicbrainz/search', {
    params: {
      ...Object.fromEntries(Object.entries(params).filter(([, value]) => !!value)),
      limit: MUSICBRAINZ_SEARCH_PAGE_SIZE,
      offset
    }
  })

  if (!response.data.success) {
    throw new Error('Search failed')
  }

  return response.data
}

export function useMusicBrainzSearch(params: MusicBrainzSearchParams) {
  const hasAnyParam = Object.values(params).some(value => !!value)

  return useInfiniteQuery({
    queryKey: ['musicbrainz', 'search', params],
    queryFn: ({ pageParam }) => searchRecordings(params, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const seen = lastPage.offset + lastPage.recordings.length
      return seen < lastPage.count ? seen : undefined
    },
    enabled: hasAnyParam
  })
}

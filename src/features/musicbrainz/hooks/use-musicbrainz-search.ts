'use client'

import {
  DEFAULT_MUSICBRAINZ_MATCH_MODE,
  MUSICBRAINZ_SEARCH_PAGE_SIZE,
  type MusicBrainzRecording,
  type MusicBrainzSearchParams
} from '@/features/musicbrainz/domain'
import { api } from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/react-query'

interface SearchResponse {
  success: true
  recordings: MusicBrainzRecording[]
  count: number
  offset: number
}

async function searchRecordings(params: MusicBrainzSearchParams, offset: number): Promise<SearchResponse> {
  const { matchMode, ...fields } = params

  const response = await api.get<SearchResponse>('/musicbrainz/search', {
    params: {
      ...Object.fromEntries(Object.entries(fields).filter(([, value]) => !!value)),
      match: matchMode ?? DEFAULT_MUSICBRAINZ_MATCH_MODE,
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
  const hasAnyParam = Object.entries(params).some(([key, value]) => key !== 'matchMode' && !!value)

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

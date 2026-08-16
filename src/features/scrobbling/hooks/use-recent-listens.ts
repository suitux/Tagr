'use client'

import type { ListenWithSong } from '@/features/scrobbling/domain'
import type { Song } from '@/features/songs/domain'
import { api } from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 100

interface ListensSuccessResponse {
  success: true
  totalListens: number
  listens: ListenWithSong[]
}

interface ListensErrorResponse {
  success: false
  error: string
}

type ListensResponse = ListensSuccessResponse | ListensErrorResponse

export const RECENT_LISTENS_QUERY_KEY = ['listens', 'recent']

async function fetchListens(offset: number): Promise<ListensResponse> {
  const { data } = await api.get<ListensResponse>('/listens', { params: { limit: PAGE_SIZE, offset } })
  return data
}

/** Distinct songs in listen order, so a track played five times shows up once. */
function toUniqueSongs(listens: ListenWithSong[]): Song[] {
  const seen = new Set<number>()
  const songs: Song[] = []

  for (const listen of listens) {
    if (!listen.song || seen.has(listen.song.id)) continue
    seen.add(listen.song.id)
    songs.push(listen.song)
  }

  return songs
}

export function useRecentListens() {
  const query = useInfiniteQuery({
    queryKey: RECENT_LISTENS_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) => fetchListens(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.success) return undefined
      const nextOffset = lastPageParam + lastPage.listens.length
      return nextOffset < lastPage.totalListens ? nextOffset : undefined
    }
  })

  const listens = query.data?.pages.flatMap(page => (page.success ? page.listens : [])) ?? []

  return { ...query, listens, songs: toUniqueSongs(listens) }
}

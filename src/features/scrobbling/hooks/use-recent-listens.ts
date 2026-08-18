'use client'

import type { RecentlyListenedSongRow, ListenWithSong } from '@/features/scrobbling/domain'
import type { SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

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

async function fetchListens(
  offset: number,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters
): Promise<ListensResponse> {
  const params: Record<string, string | number | undefined> = {
    limit: PAGE_SIZE,
    offset,
    search,
    ...sorting
  }

  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value) params[`filter.${field}`] = value
    }
  }

  const { data } = await api.get<ListensResponse>('/listens', { params })
  return data
}

/** One row per play: the song's current tags plus the moment it was listened to. */
function toRows(listens: ListenWithSong[]): RecentlyListenedSongRow[] {
  return listens
    .filter((listen): listen is ListenWithSong & { song: NonNullable<ListenWithSong['song']> } => !!listen.song)
    .map(listen => ({ ...listen.song, listenId: listen.id, listenedAt: listen.listenedAt }))
}

interface UseRecentListensParams {
  search?: string
  sorting?: SongsSortParams
  filters?: SongColumnFilters
}

export function useRecentListens({ search, sorting, filters }: UseRecentListensParams = {}) {
  const query = useInfiniteQuery({
    queryKey: [...RECENT_LISTENS_QUERY_KEY, search, sorting?.sortField, sorting?.sort, filters],
    queryFn: ({ pageParam = 0 }) => fetchListens(pageParam, search, sorting, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.success) return undefined
      const nextOffset = lastPageParam + lastPage.listens.length
      return nextOffset < lastPage.totalListens ? nextOffset : undefined
    },
    placeholderData: keepPreviousData
  })

  const listens = query.data?.pages.flatMap(page => (page.success ? page.listens : [])) ?? []
  const totalListens = (query.data?.pages[0]?.success === true && query.data.pages[0].totalListens) || null

  return { ...query, listens, rows: toRows(listens), totalListens }
}

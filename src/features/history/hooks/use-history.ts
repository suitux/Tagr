'use client'

import { SongChangeHistoryEntry } from '@/features/history/domain'
import { api } from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/react-query'

interface HistoryResponse {
  success: true
  entries: SongChangeHistoryEntry[]
  nextCursor: number | null
}

interface HistoryFilters {
  search?: string
  songId?: number
}

export const getHistoryQueryKey = (filters?: HistoryFilters) => ['history', filters ?? {}]

async function getHistory(cursor: number | null, filters?: HistoryFilters): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>('/history', {
    params: { cursor: String(cursor), search: filters?.search, songId: filters?.songId, limit: 50 }
  })
  return data
}

export function useHistory(enabled = true, filters?: HistoryFilters) {
  return useInfiniteQuery({
    queryKey: getHistoryQueryKey(filters),
    queryFn: ({ pageParam }) => getHistory(pageParam, filters),
    initialPageParam: null as number | null,
    getNextPageParam: lastPage => lastPage.nextCursor,
    enabled
  })
}

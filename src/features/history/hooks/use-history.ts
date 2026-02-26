'use client'

import { SongChangeHistoryEntry } from '@/features/history/domain'
import { api } from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/react-query'

interface HistoryResponse {
  success: true
  entries: SongChangeHistoryEntry[]
  nextCursor: number | null
}

export const getHistoryQueryKey = (search?: string) => ['history', search ?? '']

async function getHistory(cursor: number | null, search?: string): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>(`/history`, { params: { cursor: String(cursor), search, limit: 50 } })
  return data
}

export function useHistory(enabled = true, search?: string) {
  return useInfiniteQuery({
    queryKey: getHistoryQueryKey(search),
    queryFn: ({ pageParam }) => getHistory(pageParam, search),
    initialPageParam: null as number | null,
    getNextPageParam: lastPage => lastPage.nextCursor,
    enabled
  })
}

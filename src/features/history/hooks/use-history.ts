'use client'

import { SongChangeHistoryEntry } from '@/features/history/domain'
import { api } from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/react-query'

interface HistoryResponse {
  success: true
  entries: SongChangeHistoryEntry[]
  nextCursor: number | null
}

export const getHistoryQueryKey = () => ['history']

export function useHistory(enabled = true) {
  return useInfiniteQuery({
    queryKey: getHistoryQueryKey(),
    queryFn: async ({ pageParam }: { pageParam: number | null }) => {
      const params = new URLSearchParams({ limit: '50' })
      if (pageParam) params.set('cursor', String(pageParam))
      const { data } = await api.get<HistoryResponse>(`/history?${params}`)
      return data
    },
    initialPageParam: null as number | null,
    getNextPageParam: lastPage => lastPage.nextCursor,
    enabled
  })
}

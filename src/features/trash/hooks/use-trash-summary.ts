'use client'

import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import type { TrashRetentionDays, TrashSummary } from '../domain'
import { useCanManageTrash } from './use-can-manage-trash'
import { TRASH_QUERY_KEY } from './use-trash-songs'

interface TrashSummaryResponse {
  success: true
  summary: TrashSummary
  expired?: number
}

/** Under `TRASH_QUERY_KEY`, so every trash operation refreshes it along with the listing. */
export function useTrashSummary() {
  const canManageTrash = useCanManageTrash()

  return useQuery({
    queryKey: [...TRASH_QUERY_KEY, 'summary'],
    queryFn: async () => (await api.get<TrashSummaryResponse>('/trash/summary')).data.summary,
    enabled: canManageTrash
  })
}

/** How many trashed songs a retention of `retentionDays` would purge right away. */
export async function fetchExpiredCount(retentionDays: TrashRetentionDays): Promise<number> {
  const { data } = await api.get<TrashSummaryResponse>('/trash/summary', { params: { retentionDays } })
  return data.expired ?? 0
}

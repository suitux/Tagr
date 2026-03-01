import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import type { SongSortField } from '../domain'

interface DistinctResponse {
  values: string[]
}

async function fetchDistinctValues(field: SongSortField): Promise<string[]> {
  const { data } = await api.get<DistinctResponse>('/songs/distinct', {
    params: { field }
  })
  return data.values
}

export function useDistinctValues(field: SongSortField) {
  return useQuery({
    queryKey: ['songs', 'distinct', field],
    queryFn: () => fetchDistinctValues(field),
    staleTime: 5 * 60 * 1000
  })
}

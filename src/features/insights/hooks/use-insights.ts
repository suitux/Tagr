import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { InsightsStatus } from '../domain'

const INSIGHTS_QUERY_KEY = ['insights']

export function useInsights() {
  return useQuery({
    queryKey: INSIGHTS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: true; status: InsightsStatus }>('/insights')
      return data.status
    }
  })
}

export function useUpdateInsights() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data } = await api.put<{ success: true; status: InsightsStatus }>('/insights', { enabled })
      return data.status
    },
    onSuccess: status => {
      queryClient.setQueryData(INSIGHTS_QUERY_KEY, status)
    }
  })
}

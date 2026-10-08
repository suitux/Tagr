import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { InsightsNoticeState, InsightsStatus } from '../domain'

const INSIGHTS_QUERY_KEY = ['insights']
const INSIGHTS_NOTICE_QUERY_KEY = ['insights', 'notice']

export function useInsights(enabled = true) {
  return useQuery({
    queryKey: INSIGHTS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: true; status: InsightsStatus }>('/insights')
      return data.status
    },
    enabled
  })
}

export function useInsightsNotice(enabled: boolean) {
  return useQuery({
    queryKey: INSIGHTS_NOTICE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: true; notice: InsightsNoticeState }>('/insights/notice')
      return data.notice
    },
    enabled,
    staleTime: Infinity
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
      // Any answer, from the banner or from Settings, settles the notice
      queryClient.setQueryData<InsightsNoticeState>(INSIGHTS_NOTICE_QUERY_KEY, { pending: false })
    }
  })
}

export function useSendInsightsNow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ success: true; status: InsightsStatus }>('/insights/send')
      return data.status
    },
    onSuccess: status => {
      queryClient.setQueryData(INSIGHTS_QUERY_KEY, status)
    }
  })
}

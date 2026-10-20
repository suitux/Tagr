'use client'

import { api } from '@/lib/axios'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TrashRetentionDays, TrashSettings } from '../domain'

export const trashSettingsQueryOptions = queryOptions({
  queryKey: ['trash-settings'],
  queryFn: async () => {
    const { data } = await api.get<{ success: true; settings: TrashSettings }>('/trash/settings')
    return data.settings
  }
})

export function useTrashSettings(enabled = true) {
  return useQuery({ ...trashSettingsQueryOptions, enabled })
}

export function useUpdateTrashSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (retentionDays: TrashRetentionDays) => {
      const { data } = await api.put<{ success: true; settings: TrashSettings }>('/trash/settings', { retentionDays })
      return data.settings
    },
    onSuccess: settings => queryClient.setQueryData(trashSettingsQueryOptions.queryKey, settings)
  })
}

'use client'

import { getSavedFiltersQueryKey } from '@/features/saved-filters/hooks/use-saved-filters'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteSavedFilter(id: number) {
  const response = await api.delete(`/saved-filters/${id}`)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSavedFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSavedFiltersQueryKey() })
    }
  })
}

'use client'

import type { SongColumnFilters } from '@/features/songs/domain'
import { getSavedFiltersQueryKey } from '@/features/saved-filters/hooks/use-saved-filters'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateSavedFilterParams {
  name: string
  filters: SongColumnFilters
}

async function createSavedFilter({ name, filters }: CreateSavedFilterParams) {
  const response = await api.post('/saved-filters', {
    name,
    filters: JSON.stringify(filters)
  })

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.filter
}

export function useCreateSavedFilter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSavedFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSavedFiltersQueryKey() })
    }
  })
}

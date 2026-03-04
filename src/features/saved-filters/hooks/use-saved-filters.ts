'use client'

import type { SavedFilter } from '@/features/saved-filters/domain'
import type { SongColumnFilters } from '@/features/songs/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface SavedFiltersSuccessResponse {
  success: true
  filters: { id: number; name: string; filters: string; createdAt: string }[]
}

interface SavedFiltersErrorResponse {
  success: false
  error: string
}

type SavedFiltersResponse = SavedFiltersSuccessResponse | SavedFiltersErrorResponse

async function fetchSavedFilters(): Promise<SavedFilter[]> {
  const response = await api.get<SavedFiltersResponse>('/saved-filters')

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.filters.map(f => ({
    ...f,
    filters: JSON.parse(f.filters) as SongColumnFilters
  }))
}

export const getSavedFiltersQueryKey = () => ['saved-filters']

export function useSavedFilters() {
  return useQuery({
    queryKey: getSavedFiltersQueryKey(),
    queryFn: fetchSavedFilters
  })
}

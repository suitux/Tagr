import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Song, SongColumnFilters } from '../domain'
import type { SongsSortParams } from './use-songs-by-folder'

interface AdjacentSongsResponse {
  success: true
  previous: Song | null
  next: Song | null
}

async function fetchAdjacentSongs(
  songId: number,
  folderPath: string,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters
): Promise<{ previous: Song | null; next: Song | null }> {
  const params: Record<string, string | number | undefined> = {
    folderPath,
    search,
    ...sorting
  }

  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value) params[`filter.${field}`] = value
    }
  }

  const { data } = await api.get<AdjacentSongsResponse>(`/songs/${songId}/adjacent`, { params })

  return { previous: data.previous, next: data.next }
}

export function useAdjacentSongs(
  songId: number | null,
  folderPath: string | null,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters
) {
  return useQuery({
    queryKey: ['songs', 'adjacent', songId, folderPath, search, sorting?.sortField, sorting?.sort, filters],
    queryFn: () => fetchAdjacentSongs(songId!, folderPath!, search, sorting, filters),
    enabled: !!songId && !!folderPath
  })
}

'use client'

import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 50

interface SongsSuccessResponse {
  success: true
  playlistId: number
  totalFiles: number
  files: Song[]
}

interface SongsErrorResponse {
  success: false
  error: string
}

type SongsResponse = SongsSuccessResponse | SongsErrorResponse

async function fetchPlaylistSongs(
  playlistId: number,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters,
  limit?: number,
  offset?: number,
  metadataKeys?: string[]
): Promise<SongsResponse> {
  const params: Record<string, string | number | undefined> = {
    search,
    ...sorting,
    limit,
    offset,
    ...(metadataKeys && metadataKeys.length > 0 && { metadataKeys: metadataKeys.join(',') })
  }
  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value) params[`filter.${field}`] = value
    }
  }
  const { data } = await api.get<SongsResponse>(`/smart-playlists/${playlistId}/songs`, { params })
  return data
}

export const getSmartPlaylistSongsQueryKey = (
  playlistId: number | null,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters,
  metadataKeys?: string[]
) => ['smart-playlists', playlistId, 'songs', search, sorting?.sortField, sorting?.sort, filters, metadataKeys]

interface UseSmartPlaylistSongsParams {
  playlistId: number | null
  search?: string
  sorting?: SongsSortParams
  filters?: SongColumnFilters
  metadataKeys?: string[]
}

export function useSmartPlaylistSongs({
  playlistId,
  search,
  sorting,
  filters,
  metadataKeys
}: UseSmartPlaylistSongsParams) {
  return useInfiniteQuery({
    queryKey: getSmartPlaylistSongsQueryKey(playlistId, search, sorting, filters, metadataKeys),
    queryFn: ({ pageParam = 0 }) =>
      fetchPlaylistSongs(playlistId!, search, sorting, filters, PAGE_SIZE, pageParam, metadataKeys),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.success) return undefined
      const nextOffset = lastPageParam + lastPage.files.length
      return nextOffset < lastPage.totalFiles ? nextOffset : undefined
    },
    enabled: playlistId != null,
    placeholderData: keepPreviousData
  })
}

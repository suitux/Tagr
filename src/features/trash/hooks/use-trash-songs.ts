'use client'

import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { api } from '@/lib/axios'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 50

export const TRASH_QUERY_KEY = ['trash']

type TrashResponse = { success: true; totalFiles: number; files: Song[] } | { success: false; error: string }

async function fetchTrash(
  offset: number,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters,
  metadataKeys?: string[]
): Promise<TrashResponse> {
  const params: Record<string, string | number | undefined> = {
    limit: PAGE_SIZE,
    offset,
    search,
    ...sorting,
    ...(metadataKeys && metadataKeys.length > 0 && { metadataKeys: metadataKeys.join(',') })
  }

  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value) params[`filter.${field}`] = value
    }
  }

  const { data } = await api.get<TrashResponse>('/trash', { params })
  return data
}

interface UseTrashSongsParams {
  search?: string
  sorting?: SongsSortParams
  filters?: SongColumnFilters
  metadataKeys?: string[]
}

export function useTrashSongs({ search, sorting, filters, metadataKeys }: UseTrashSongsParams = {}) {
  const query = useInfiniteQuery({
    queryKey: [...TRASH_QUERY_KEY, 'songs', search, sorting?.sortField, sorting?.sort, filters, metadataKeys],
    queryFn: ({ pageParam = 0 }) => fetchTrash(pageParam, search, sorting, filters, metadataKeys),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.success) return undefined
      const nextOffset = lastPageParam + lastPage.files.length
      return nextOffset < lastPage.totalFiles ? nextOffset : undefined
    },
    placeholderData: keepPreviousData
  })

  const songs = query.data?.pages.flatMap(page => (page.success ? page.files : [])) ?? []
  const firstPage = query.data?.pages[0]
  const totalSongs = firstPage?.success === true ? firstPage.totalFiles : null

  return { ...query, songs, totalSongs }
}

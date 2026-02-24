import { api } from '@/lib/axios'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import type { Song, SongColumnFilters, SongSortDirection, SongSortField } from '../domain'

const PAGE_SIZE = 50

export interface SongsSuccessResponse {
  success: true
  folderPath: string
  totalFiles: number
  files: Song[]
}

interface SongsErrorResponse {
  success: false
  error: string
}

type SongsResponse = SongsSuccessResponse | SongsErrorResponse

export interface SongsSortParams {
  sortField?: SongSortField
  sort?: SongSortDirection
}

async function fetchSongsByFolder(
  folderPath: string,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters,
  limit?: number,
  offset?: number
): Promise<SongsResponse> {
  const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath

  const encodedPath = pathWithoutLeadingSlash
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')

  const params: Record<string, string | number | undefined> = {
    search,
    ...sorting,
    limit,
    offset
  }

  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value) params[`filter.${field}`] = value
    }
  }

  const { data } = await api.get<SongsResponse>(`/songs/${encodedPath}`, {
    params
  })

  return data
}

export const getUseSongsByFolderQueryKey = (
  folderPath: string | undefined,
  search?: string,
  sorting?: SongsSortParams,
  filters?: SongColumnFilters
) => ['songs', 'folder', folderPath, search, sorting?.sortField, sorting?.sort, filters]

export function useSongsByFolder(folderPath: string | undefined, search?: string, sorting?: SongsSortParams, filters?: SongColumnFilters) {
  return useInfiniteQuery({
    queryKey: getUseSongsByFolderQueryKey(folderPath, search, sorting, filters),
    queryFn: ({ pageParam = 0 }) => fetchSongsByFolder(folderPath!, search, sorting, filters, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.success) return undefined
      const nextOffset = lastPageParam + lastPage.files.length
      return nextOffset < lastPage.totalFiles ? nextOffset : undefined
    },
    enabled: !!folderPath,
    placeholderData: keepPreviousData
  })
}

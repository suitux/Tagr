import { api } from '@/lib/axios'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Song, SongSortDirection, SongSortField } from '../domain'

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
  sorting?: SongsSortParams
): Promise<SongsResponse> {
  const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath

  const encodedPath = pathWithoutLeadingSlash
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')

  const params = {
    search,
    ...sorting
  }

  const { data } = await api.get<SongsResponse>(`/songs/${encodedPath}`, {
    params: Object.keys(params).length > 0 ? params : undefined
  })

  return data
}

export const getUseSongsByFolderQueryKey = (
  folderPath: string | undefined,
  search?: string,
  sorting?: SongsSortParams
) => ['songs', 'folder', folderPath, search, sorting?.sortField, sorting?.sort]

export function useSongsByFolder(folderPath: string | undefined, search?: string, sorting?: SongsSortParams) {
  return useQuery({
    queryKey: getUseSongsByFolderQueryKey(folderPath, search, sorting),
    queryFn: () => fetchSongsByFolder(folderPath!, search, sorting),
    enabled: !!folderPath,
    placeholderData: keepPreviousData
  })
}

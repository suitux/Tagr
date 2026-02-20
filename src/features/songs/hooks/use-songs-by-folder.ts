import { api } from '@/lib/axios'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { Song } from '../domain'

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

async function fetchSongsByFolder(folderPath: string, search?: string): Promise<SongsResponse> {
  const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath

  const encodedPath = pathWithoutLeadingSlash
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')

  const { data } = await api.get<SongsResponse>(`/songs/${encodedPath}`, {
    params: search ? { search } : undefined
  })

  return data
}

export const getUseSongsByFolderQueryKey = (folderPath: string | undefined, search?: string) => [
  'songs',
  'folder',
  folderPath,
  search
]

export function useSongsByFolder(folderPath: string | undefined, search?: string) {
  return useQuery({
    queryKey: getUseSongsByFolderQueryKey(folderPath, search),
    queryFn: () => fetchSongsByFolder(folderPath!, search),
    enabled: !!folderPath,
    placeholderData: keepPreviousData
  })
}

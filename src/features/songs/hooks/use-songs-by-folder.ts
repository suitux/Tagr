import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import type { Song } from '../domain'

interface SongsSuccessResponse {
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

async function fetchSongsByFolder(folderPath: string): Promise<SongsResponse> {
  const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
  const encodedPath = pathWithoutLeadingSlash
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
  const { data } = await api.get<SongsResponse>(`/songs/${encodedPath}`)
  return data
}

export function useSongsByFolder(folderPath: string | undefined) {
  return useQuery({
    queryKey: ['songs', folderPath],
    queryFn: () => fetchSongsByFolder(folderPath!),
    enabled: !!folderPath
  })
}

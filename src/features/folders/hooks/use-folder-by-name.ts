import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import type { FoldersResponse } from './use-folders'

async function fetchFolderByPath(folderPath: string): Promise<FoldersResponse> {
  const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
  const encodedPath = pathWithoutLeadingSlash
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
  const { data } = await api.get<FoldersResponse>(`/folders/${encodedPath}`)
  return data
}

export function useFolderByPath(folderPath: string | undefined) {
  return useQuery({
    queryKey: ['folder', folderPath],
    queryFn: () => fetchFolderByPath(folderPath!),
    enabled: !!folderPath
  })
}

import { FolderContent } from '@/features/folders/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

export interface FoldersResponse {
  success: boolean
  error?: string
  summary?: {
    totalFolders: number
    totalFiles: number
    totalSubfolders: number
    foldersWithErrors: number
  }
  folders: FolderContent[]
}

async function fetchFolders(folderPath?: string, search?: string): Promise<FoldersResponse> {
  if (folderPath) {
    const pathWithoutLeadingSlash = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
    const encodedPath = pathWithoutLeadingSlash
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/')
    const { data } = await api.get<FoldersResponse>(`/folders/${encodedPath}`)
    return data
  }

  const { data } = await api.get<FoldersResponse>('/folders', { params: search ? { search } : undefined })
  return data
}

export function useFolders(folderPath?: string, search?: string) {
  return useQuery({
    queryKey: folderPath ? ['folders', folderPath] : ['folders', { search }],
    queryFn: () => fetchFolders(folderPath, search)
  })
}

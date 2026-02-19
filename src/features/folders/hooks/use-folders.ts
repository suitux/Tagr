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

async function fetchFolders(): Promise<FoldersResponse> {
  const { data } = await api.get<FoldersResponse>('/folders')
  return data
}

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders
  })
}

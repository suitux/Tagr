import type { FolderContent, MusicFile } from '@/app/api/folders/route'
import { useQuery } from '@tanstack/react-query'

export interface FoldersResponse {
  success: boolean
  error?: string
  summary?: {
    totalFolders: number
    totalFiles: number
    foldersWithErrors: number
  }
  folders: FolderContent[]
}

async function fetchFolders(): Promise<FoldersResponse> {
  const response = await fetch('/api/folders')
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Error al obtener las carpetas')
  }
  return response.json()
}

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders
  })
}

export type { FolderContent, MusicFile }

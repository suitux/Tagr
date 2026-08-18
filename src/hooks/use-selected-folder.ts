'use client'

import { useParams, usePathname } from 'next/navigation'
import { segmentsToFolderPath } from '@/lib/library-routes'

export function useSelectedFolder() {
  const pathname = usePathname()
  const params = useParams<{ path?: string[] }>()

  const isLibraryRoute = pathname === '/library' || pathname.startsWith('/library/')
  const selectedFolderId = isLibraryRoute ? segmentsToFolderPath(params.path) : null

  return { selectedFolderId }
}

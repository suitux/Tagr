'use client'

import { useCallback } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'

export function folderHref(folderId: string | null): string {
  const seg = !folderId || folderId === ALL_SONGS_FOLDER_ID ? ALL_SONGS_FOLDER_ID : encodeURIComponent(folderId)
  return `/folders/${seg}`
}

export function useSelectedFolder() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ folderId?: string }>()

  const selectedFolderId = decodeURIComponent(
    pathname.startsWith('/folders/') && params.folderId ? params.folderId : ''
  )

  const setSelectedFolderId = useCallback(
    (folderId: string | null) => {
      router.push(folderHref(folderId))
    },
    [router]
  )

  return { selectedFolderId, setSelectedFolderId }
}

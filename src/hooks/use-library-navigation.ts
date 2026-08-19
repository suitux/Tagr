'use client'

import { useRouter } from 'next/navigation'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { buildFolderHref, buildPlaylistHref, RECENT_LISTENS_ROUTE } from '@/lib/library-routes'

export function useLibraryNavigation() {
  const router = useRouter()

  const navigateToFolder = (folderPath: string | null) => {
    router.push(buildFolderHref(folderPath ?? ALL_SONGS_FOLDER_ID))
  }

  const navigateToPlaylist = (playlistId: number | null) => {
    if (playlistId === null) {
      router.push(buildFolderHref(ALL_SONGS_FOLDER_ID))
      return
    }

    router.push(buildPlaylistHref(playlistId))
  }

  const navigateToRecentListens = () => {
    router.push(RECENT_LISTENS_ROUTE)
  }

  return { navigateToFolder, navigateToPlaylist, navigateToRecentListens }
}

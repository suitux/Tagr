'use client'

import type { ListenWithSong } from '@/features/scrobbling/domain'
import { RECENT_LISTENS_QUERY_KEY } from '@/features/scrobbling/hooks/use-recent-listens'
import type { BulkTarget } from '@/features/songs/bulk-target'
import type { Song, SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import type { SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

type ListensResponse =
  | { success: true; totalListens: number; totalSongs: number; listens: ListenWithSong[] }
  | { success: false; error: string }

const isSongsListQuery = ({ queryKey }: { queryKey: QueryKey }) => queryKey[0] === 'songs' && queryKey[1] === 'folder'

const isPlaylistSongsQuery = ({ queryKey }: { queryKey: QueryKey }) =>
  queryKey[0] === 'smart-playlists' && queryKey[2] === 'songs'

const isRecentListensQuery = ({ queryKey }: { queryKey: QueryKey }) =>
  queryKey[0] === RECENT_LISTENS_QUERY_KEY[0] && queryKey[1] === RECENT_LISTENS_QUERY_KEY[1]

function patchSongsPages(updates: Map<number, Song>) {
  return (oldData: InfiniteData<SongsResponse, number> | undefined) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      pages: oldData.pages.map(page => {
        if (!page.success) return page
        return { ...page, files: page.files.map(song => updates.get(song.id) ?? song) }
      })
    }
  }
}

function patchListensPages(updates: Map<number, Song>) {
  return (oldData: InfiniteData<ListensResponse, number> | undefined) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      pages: oldData.pages.map(page => {
        if (!page.success) return page
        return {
          ...page,
          listens: page.listens.map(listen => {
            const song = listen.songId === null ? undefined : updates.get(listen.songId)
            return song ? { ...listen, song } : listen
          })
        }
      })
    }
  }
}

function applySongUpdatesToListings(queryClient: QueryClient, updates: Map<number, Song>): void {
  queryClient.setQueriesData<InfiniteData<SongsResponse, number>>(
    { predicate: isSongsListQuery },
    patchSongsPages(updates)
  )
  queryClient.setQueriesData<InfiniteData<SongsResponse, number>>(
    { predicate: isPlaylistSongsQuery },
    patchSongsPages(updates)
  )
  queryClient.setQueriesData<InfiniteData<ListensResponse, number>>(
    { predicate: isRecentListensQuery },
    patchListensPages(updates)
  )
}

export function applyBulkSongUpdates(queryClient: QueryClient, updates: Map<number, SongWithMetadata>): void {
  applySongUpdatesToListings(queryClient, updates)

  for (const [id, song] of updates) {
    queryClient.setQueryData(getSongQueryKey(id), song)
  }
}

export function invalidateBulkTargetQueries(queryClient: QueryClient, target: BulkTarget): void {
  if (target.mode !== 'all-in-context') return

  switch (target.context.type) {
    case 'folder':
      void queryClient.invalidateQueries({ predicate: isSongsListQuery })
      return
    case 'smart-playlist':
      void queryClient.invalidateQueries({ predicate: isPlaylistSongsQuery })
      return
    case 'recent-listens':
      void queryClient.invalidateQueries({ predicate: isRecentListensQuery })
      return
  }
}

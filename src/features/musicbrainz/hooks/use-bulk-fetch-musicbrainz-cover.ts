'use client'

import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { type SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { api } from '@/lib/axios'
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

interface BulkCoverParams {
  target: BulkTarget
}

type ResultEntry =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

interface BulkCoverSuccessResponse {
  success: true
  resolvedCount: number
  results: ResultEntry[]
}

interface BulkCoverErrorResponse {
  success: false
  error: string
}

type BulkCoverResponse = BulkCoverSuccessResponse | BulkCoverErrorResponse

async function bulkFetchCover(params: BulkCoverParams): Promise<BulkCoverSuccessResponse> {
  const response = await api.post<BulkCoverResponse>('/songs/bulk/musicbrainz/fetch-cover', params)
  if (!response.data.success) {
    throw new Error(response.data.error)
  }
  return response.data
}

type SongsResponse = SongsSuccessResponse | { success: false; error: string }

function applyUpdatesToCache(updates: Map<number, SongWithMetadata>) {
  return (oldData: InfiniteData<SongsResponse, number> | undefined) => {
    if (!oldData) return oldData
    return {
      ...oldData,
      pages: oldData.pages.map(page => {
        if (!page.success) return page
        return {
          ...page,
          files: page.files.map(song => updates.get(song.id) ?? song)
        }
      })
    }
  }
}

export function useBulkFetchMusicBrainzCover() {
  const queryClient = useQueryClient()
  const clear = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: bulkFetchCover,
    onSuccess: (data, variables) => {
      const updates = new Map<number, SongWithMetadata>()
      for (const r of data.results) {
        if (r.ok) updates.set(r.songId, r.song)
      }

      if (updates.size > 0) {
        queryClient.setQueriesData<InfiniteData<SongsResponse, number>>(
          { predicate: ({ queryKey }) => queryKey[0] === 'songs' && queryKey[1] === 'folder' },
          applyUpdatesToCache(updates)
        )
        queryClient.setQueriesData<InfiniteData<SongsResponse, number>>(
          { predicate: ({ queryKey }) => queryKey[0] === 'smart-playlists' && queryKey[2] === 'songs' },
          applyUpdatesToCache(updates)
        )
        for (const [id, song] of updates) {
          queryClient.setQueryData(getSongQueryKey(id), song)
        }
        invalidateAllHistoryQueryKeys(queryClient)
      }

      if (variables.target.mode === 'all-in-context') {
        if (variables.target.context.type === 'folder') {
          void queryClient.invalidateQueries({
            predicate: ({ queryKey }) => queryKey[0] === 'songs' && queryKey[1] === 'folder'
          })
        } else {
          void queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
              queryKey[0] === 'smart-playlists' && queryKey[2] === 'songs'
          })
        }
      }

      clear()
    }
  })
}

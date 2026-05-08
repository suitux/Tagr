'use client'

import { incrementEditCount } from '@/components/star-prompt-dialog'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { type SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { api } from '@/lib/axios'
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

interface BulkUpdateParams {
  target: BulkTarget
  metadata?: Partial<SongMetadataUpdate>
  customMetadata?: { key: string; value: string | null }[]
}

type ResultEntry =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

interface BulkUpdateSuccessResponse {
  success: true
  resolvedCount: number
  results: ResultEntry[]
}

interface BulkUpdateErrorResponse {
  success: false
  error: string
}

type BulkUpdateResponse = BulkUpdateSuccessResponse | BulkUpdateErrorResponse

async function bulkUpdate(params: BulkUpdateParams): Promise<BulkUpdateSuccessResponse> {
  const response = await api.patch<BulkUpdateResponse>('/songs/bulk', params)
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

export function useBulkUpdateSongs() {
  const queryClient = useQueryClient()
  const clear = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: bulkUpdate,
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
        incrementEditCount()
      }

      // For "all-in-context" mode, the server may have updated rows that
      // weren't loaded into the paginated cache. Invalidate the appropriate
      // list query so it refetches.
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

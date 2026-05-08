'use client'

import { incrementEditCount } from '@/components/star-prompt-dialog'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { type SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { readNdjsonStream } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type BulkUpdateResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

export interface BulkProgress {
  completed: number
  total: number
  lastResult?: BulkUpdateResult
}

interface BulkUpdateParams {
  target: BulkTarget
  metadata?: Partial<SongMetadataUpdate>
  customMetadata?: { key: string; value: string | null }[]
  onProgress?: (progress: BulkProgress) => void
}

interface BulkUpdateResponse {
  resolvedCount: number
  results: BulkUpdateResult[]
}

async function bulkUpdate(params: BulkUpdateParams): Promise<BulkUpdateResponse> {
  const { onProgress, ...payload } = params

  const response = await fetch('/api/songs/bulk', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? `Request failed with status ${response.status}`)
  }

  const results: BulkUpdateResult[] = []
  let total = 0
  let resolvedCount = 0

  for await (const event of readNdjsonStream<BulkUpdateResult>(response)) {
    if (event.type === 'start') {
      total = event.total
      onProgress?.({ completed: 0, total })
    } else if (event.type === 'result') {
      results.push(event.result)
      onProgress?.({ completed: results.length, total, lastResult: event.result })
    } else if (event.type === 'done') {
      resolvedCount = event.resolvedCount
    } else if (event.type === 'error') {
      throw new Error(event.error)
    }
  }

  return { resolvedCount, results }
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

'use client'

import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { getSongQueryKey } from '@/features/songs/hooks/use-song'
import { type SongsSuccessResponse } from '@/features/songs/hooks/use-songs-by-folder'
import { readNdjsonStream } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

type BulkCoverResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

export interface BulkProgress {
  completed: number
  total: number
  lastResult?: BulkCoverResult
}

interface BulkCoverParams {
  target: BulkTarget
  onProgress?: (progress: BulkProgress) => void
}

interface BulkCoverResponse {
  resolvedCount: number
  results: BulkCoverResult[]
}

async function bulkFetchCover(params: BulkCoverParams): Promise<BulkCoverResponse> {
  const { onProgress, ...payload } = params

  const response = await fetch('/api/songs/bulk/musicbrainz/fetch-cover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? `Request failed with status ${response.status}`)
  }

  const results: BulkCoverResult[] = []
  let total = 0
  let resolvedCount = 0

  for await (const event of readNdjsonStream<BulkCoverResult>(response)) {
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

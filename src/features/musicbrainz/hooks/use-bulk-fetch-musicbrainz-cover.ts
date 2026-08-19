'use client'

import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { applySongUpdates, invalidateBulkTargetQueries } from '@/features/songs/hooks/bulk-cache-sync'
import { readNdjsonStream } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

export function useBulkFetchMusicBrainzCover() {
  const queryClient = useQueryClient()
  const clear = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: bulkFetchCover,
    onSuccess: (data, variables) => {
      const updatedSongs = data.results.filter(result => result.ok).map(result => result.song)

      if (updatedSongs.length > 0) {
        applySongUpdates(queryClient, updatedSongs)
        invalidateAllHistoryQueryKeys(queryClient)
      }

      invalidateBulkTargetQueries(queryClient, variables.target)

      clear()
    }
  })
}

'use client'

import { RECENT_LISTENS_QUERY_KEY } from '@/features/scrobbling/hooks/use-recent-listens'
import type { BulkTarget } from '@/features/songs/bulk-target'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { collectNdjsonBulkResponse, type NdjsonBulkProgress } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TrashOperationResult } from '../domain'
import { TRASH_QUERY_KEY } from './use-trash-songs'

/** `trash` moves songs to the trash, `restore` brings them back, `delete` removes them for good. */
export type TrashOperation = 'trash' | 'restore' | 'delete'

const ENDPOINTS: Record<TrashOperation, { url: string; method: string }> = {
  trash: { url: '/api/trash', method: 'POST' },
  restore: { url: '/api/trash/restore', method: 'POST' },
  delete: { url: '/api/trash', method: 'DELETE' }
}

interface TrashOperationParams {
  operation: TrashOperation
  /** Omitted with `delete` to empty the whole trash. */
  target?: BulkTarget
  onProgress?: (progress: NdjsonBulkProgress<TrashOperationResult>) => void
}

async function runTrashOperation({ operation, target, onProgress }: TrashOperationParams) {
  const { url, method } = ENDPOINTS[operation]

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(target ? { target } : {})
  })

  return collectNdjsonBulkResponse<TrashOperationResult>(response, onProgress)
}

/** Songs change place on disk, so every listing that could show them is refetched. */
const AFFECTED_QUERY_KEYS = [['songs'], ['smart-playlists'], ['folders'], RECENT_LISTENS_QUERY_KEY, TRASH_QUERY_KEY]

export function useTrashOperation() {
  const queryClient = useQueryClient()
  const clearSelection = useBulkSelectionStore(s => s.clear)
  const { selectedSongId, setSelectedSongId } = useSelectedSong()

  return useMutation({
    mutationFn: runTrashOperation,
    onSuccess: data => {
      for (const queryKey of AFFECTED_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey })
      }

      clearSelection()

      // The song just left the view it was opened from (or does not exist any more).
      if (selectedSongId !== null && data.results.some(result => result.ok && result.songId === selectedSongId)) {
        void setSelectedSongId(null)
      }
    }
  })
}

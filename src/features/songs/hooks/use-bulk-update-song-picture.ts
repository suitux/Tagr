'use client'

import { incrementEditCount } from '@/components/star-prompt-dialog'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { applySongUpdates, invalidateBulkTargetQueries } from '@/features/songs/hooks/bulk-cache-sync'
import { collectNdjsonBulkResponse, type NdjsonBulkProgress } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type BulkPictureResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

interface BulkPictureParams {
  target: BulkTarget
  file: File
  onProgress?: (progress: NdjsonBulkProgress<BulkPictureResult>) => void
}

async function bulkUpdatePicture({ target, file, onProgress }: BulkPictureParams) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('target', JSON.stringify(target))

  const response = await fetch('/api/songs/bulk/picture', {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  return collectNdjsonBulkResponse<BulkPictureResult>(response, onProgress)
}

export function useBulkUpdateSongPicture() {
  const queryClient = useQueryClient()
  const clear = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: bulkUpdatePicture,
    onSuccess: (data, variables) => {
      const updatedSongs = data.results.filter(result => result.ok).map(result => result.song)

      if (updatedSongs.length > 0) {
        applySongUpdates(queryClient, updatedSongs)
        invalidateAllHistoryQueryKeys(queryClient)
        incrementEditCount()
      }

      invalidateBulkTargetQueries(queryClient, variables.target)

      clear()
    }
  })
}

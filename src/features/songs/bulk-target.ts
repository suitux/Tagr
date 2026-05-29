import type { SongColumnFilters } from '@/features/songs/domain'

export type BulkTarget =
  | { mode: 'ids'; songIds: number[] }
  | {
      mode: 'all-in-context'
      context: { type: 'folder'; folderPath: string } | { type: 'smart-playlist'; playlistId: number }
      search?: string
      filters?: SongColumnFilters
      exclusions?: number[]
    }

export const BULK_RESOLVE_LIMIT = 50000

export interface BulkOperationResultEntry {
  songId: number
  ok: boolean
  error?: string
}

export interface BulkOperationResponse<TPayload = unknown> {
  success: true
  resolvedCount: number
  results: Array<({ songId: number; ok: true } & TPayload) | { songId: number; ok: false; error: string }>
}

export interface BulkOperationErrorResponse {
  success: false
  error: string
}

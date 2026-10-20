import type { Song } from '@/features/songs/domain'

export const TRASH_RETENTION_OPTIONS = [1, 5, 10, 15, 30] as const

export type TrashRetentionDays = (typeof TRASH_RETENTION_OPTIONS)[number]

export const DEFAULT_TRASH_RETENTION_DAYS: TrashRetentionDays = 30

export const TRASH_RETENTION_DAYS_KEY = 'trashRetentionDays'

export function isTrashRetentionDays(value: unknown): value is TrashRetentionDays {
  return TRASH_RETENTION_OPTIONS.includes(value as TrashRetentionDays)
}

/** Per-song outcome of a trash operation; `song` is the row as it was left (or as it was, once purged). */
export type TrashOperationResult =
  | { songId: number; ok: true; song: Song }
  | { songId: number; ok: false; error: string }

export interface TrashSettings {
  retentionDays: TrashRetentionDays
}

export const TRASH_RETENTION_OPTIONS = [1, 5, 10, 15, 30] as const

export type TrashRetentionDays = (typeof TRASH_RETENTION_OPTIONS)[number]

export const DEFAULT_TRASH_RETENTION_DAYS: TrashRetentionDays = 30

export const TRASH_RETENTION_DAYS_KEY = 'trashRetentionDays'

export function isTrashRetentionDays(value: unknown): value is TrashRetentionDays {
  return TRASH_RETENTION_OPTIONS.includes(value as TrashRetentionDays)
}

/** Why a song could not be trashed, restored or purged; the client turns it into a translated message. */
export const TRASH_ERROR_CODES = [
  'notFound',
  'alreadyTrashed',
  'notTrashed',
  'outsideLibrary',
  /** Restoring: another file sits where the song used to be. */
  'conflict',
  /** The music folder is mounted read-only, or the server may not write to it. */
  'readOnly',
  /** The file is no longer on disk. */
  'missingFile',
  'unknown'
] as const

export type TrashErrorCode = (typeof TRASH_ERROR_CODES)[number]

export class TrashError extends Error {
  constructor(
    public code: TrashErrorCode,
    message: string,
    /** The file the error is about, so a list of failures can name each song. */
    public fileName?: string
  ) {
    super(message)
  }
}

/** Per-song outcome of a trash operation. */
export type TrashOperationResult =
  | { songId: number; ok: true }
  | { songId: number; ok: false; code: TrashErrorCode; error: string; fileName?: string }

export interface TrashSettings {
  retentionDays: TrashRetentionDays
}

export interface TrashSummary {
  count: number
  /** Bytes the trashed files take on disk, as recorded when each was scanned. */
  totalSize: number
}

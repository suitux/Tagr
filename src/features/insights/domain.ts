/**
 * Anonymous usage report an instance sends once a day to the Tagr Insights server
 * (github.com/suitux/tagr-insights). Only counts and flags: never paths, titles or usernames.
 *
 * Bump `schema` whenever a field changes meaning, so the server can tell old reports apart.
 */
export interface InsightsData {
  schema: 1
  id: string
  version: string
  /** Seconds since the server process started */
  uptime: number
  os: {
    platform: string
    arch: string
    containerized: boolean
    nodeVersion: string
  }
  library: {
    songs: number
    musicFolders: number
    /** Song count per lowercase file extension, e.g. { flac: 1200, mp3: 300 } */
    fileExtensions: Record<string, number>
  }
  users: {
    total: number
    /** Distinct users who played something in the last 7 days */
    listeners7d: number
  }
  usage7d: {
    metadataEdits: number
    editedSongs: number
    listens: number
  }
  features: {
    smartPlaylists: number
    savedFilters: number
    sharedLinks: number
    /** Enabled scrobbling accounts per provider */
    scrobbleAccounts: Record<string, number>
  }
}

export interface InsightsStatus {
  enabled: boolean
  /** Set when an env var decides, so the Settings toggle can't override it */
  forcedByEnv: boolean
  endpoint: string
  lastSentAt: string | null
  /** False until an admin has answered the in-app notice; nothing is sent before that */
  noticeAcknowledged: boolean
  /** Exactly what the next report would contain */
  preview: InsightsData
}

export interface InsightsNoticeState {
  /** The admin still has to be told that reports are sent */
  pending: boolean
}

export type InsightsSendResult =
  | { sent: true }
  | { sent: false; reason: 'disabled' | 'noticePending' | 'failed'; error?: string }

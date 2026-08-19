import type { Listen, Song } from '@/generated/prisma/client'

export type ScrobbleProviderId = 'listenbrainz'

export const SCROBBLE_PROVIDER_IDS: ScrobbleProviderId[] = ['listenbrainz']

/** ListenBrainz rule: submit after half the track or 4 minutes, whichever comes first. */
export const SCROBBLE_LISTEN_THRESHOLD_S = 240

/** Tracks shorter than this are never scrobbled. */
export const MIN_SCROBBLE_DURATION_S = 30

/** Retries per queued listen before it is dropped. */
export const MAX_SCROBBLE_ATTEMPTS = 10

/**
 * Real playback seconds before a play lands in Tagr's own history. Short enough that anything
 * the user actually listens to shows up in "recently played", long enough to keep skips out.
 */
export const LOCAL_HISTORY_THRESHOLD_S = 5

/** Seconds of real playback needed before a play counts as a listen. */
export function listenThresholdSeconds(durationS: number | null | undefined): number {
  if (!durationS || durationS <= 0) return SCROBBLE_LISTEN_THRESHOLD_S
  return Math.min(SCROBBLE_LISTEN_THRESHOLD_S, durationS / 2)
}

/**
 * Seconds of real playback needed before a play enters the local history. Unlike scrobbling,
 * no track is too short: a jingle only has to be played past its own halfway point.
 */
export function historyThresholdSeconds(durationS: number | null | undefined): number {
  if (!durationS || durationS <= 0) return LOCAL_HISTORY_THRESHOLD_S
  return Math.min(LOCAL_HISTORY_THRESHOLD_S, durationS / 2)
}

/** Whether a track is long enough to be worth scrobbling. */
export function isScrobbleableDuration(durationS: number | null | undefined): boolean {
  return !!durationS && durationS >= MIN_SCROBBLE_DURATION_S
}

/** Provider-agnostic listen, serialized as-is into the retry queue. */
export interface ListenPayload {
  listenedAt: string
  trackName: string
  artistName: string
  releaseName?: string
  trackNumber?: number
  durationMs?: number
  recordingMbid?: string
  releaseMbid?: string
  artistMbids?: string[]
}

/** Everything the browser is allowed to know about a scrobble account. */
export interface ScrobbleAccountPublic {
  provider: ScrobbleProviderId
  enabled: boolean
  apiRoot: string | null
  username: string | null
  lastError: string | null
  tokenSet: boolean
  pendingCount: number
}

export type ListenWithSong = Listen & { song: Song | null }

export type RecentlyListenedSongRow = Song & { listenId: number; listenedAt: Date }

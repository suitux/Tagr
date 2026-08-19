import { ScrobbleError } from '@/features/scrobbling/providers/provider'

export const LISTENBRAINZ_API = 'https://api.listenbrainz.org'
export const USER_AGENT = `Tagr/${process.env.APP_VERSION} (https://github.com/suitux/tagr)`

const REQUEST_TIMEOUT_MS = 10000

export interface ListenBrainzTrackMetadata {
  artist_name: string
  track_name: string
  release_name?: string
  additional_info?: {
    tracknumber?: number
    duration_ms?: number
    recording_mbid?: string
    release_mbid?: string
    artist_mbids?: string[]
    media_player?: string
    submission_client?: string
    submission_client_version?: string
    music_service?: string
  }
}

export interface ListenBrainzListen {
  listened_at?: number
  track_metadata: ListenBrainzTrackMetadata
}

export interface ListenBrainzSubmitPayload {
  listen_type: 'single' | 'playing_now' | 'import'
  payload: ListenBrainzListen[]
}

export interface ListenBrainzValidateTokenResponse {
  code: number
  message: string
  valid: boolean
  user_name?: string
}

/** 429 and server errors are worth retrying; a rejected token or payload is not. */
function toScrobbleError(status: number, body: string): ScrobbleError {
  const retryable = status === 429 || status >= 500
  const detail = body.slice(0, 200)
  return new ScrobbleError(`ListenBrainz request failed: ${status} ${detail}`, status, retryable)
}

async function listenBrainzFetch<T>(
  apiRoot: string,
  path: string,
  token: string,
  init?: { method: 'GET' | 'POST'; body?: unknown }
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${apiRoot.replace(/\/$/, '')}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'User-Agent': USER_AGENT,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {})
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
  } catch (error) {
    // Network failure or timeout — the listen is still valid, keep it queued.
    throw new ScrobbleError(
      `ListenBrainz unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      true
    )
  }

  if (!response.ok) {
    throw toScrobbleError(response.status, await response.text().catch(() => ''))
  }

  return (await response.json()) as T
}

export const listenBrainzApi = {
  validateToken: (apiRoot: string, token: string) =>
    listenBrainzFetch<ListenBrainzValidateTokenResponse>(apiRoot, '/1/validate-token', token),

  submitListens: (apiRoot: string, token: string, payload: ListenBrainzSubmitPayload) =>
    listenBrainzFetch<{ status: string }>(apiRoot, '/1/submit-listens', token, { method: 'POST', body: payload })
}

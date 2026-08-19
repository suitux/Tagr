import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ListenPayload } from '@/features/scrobbling/domain'
import { ScrobbleError } from '@/features/scrobbling/providers/provider'
import { buildSubmitPayload, listenBrainzProvider } from './listenbrainz.provider'

const config = { token: 'token', apiRoot: 'https://api.listenbrainz.org' }

const listen: ListenPayload = {
  listenedAt: '2026-08-16T10:00:00.000Z',
  trackName: 'Paranoid Android',
  artistName: 'Radiohead',
  releaseName: 'OK Computer',
  trackNumber: 2,
  durationMs: 383000,
  recordingMbid: 'recording-mbid',
  artistMbids: ['artist-mbid']
}

function mockFetch(status: number, body: unknown = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildSubmitPayload', () => {
  it('maps a single listen with its timestamp in seconds', () => {
    const payload = buildSubmitPayload([listen])

    expect(payload.listen_type).toBe('single')
    expect(payload.payload[0].listened_at).toBe(Math.floor(Date.parse(listen.listenedAt) / 1000))
    expect(payload.payload[0].track_metadata).toMatchObject({
      artist_name: 'Radiohead',
      track_name: 'Paranoid Android',
      release_name: 'OK Computer'
    })
    expect(payload.payload[0].track_metadata.additional_info).toMatchObject({
      tracknumber: 2,
      duration_ms: 383000,
      recording_mbid: 'recording-mbid',
      artist_mbids: ['artist-mbid'],
      media_player: 'Tagr',
      submission_client: 'Tagr'
    })
  })

  it('switches to an import when there is more than one listen', () => {
    expect(buildSubmitPayload([listen, listen]).listen_type).toBe('import')
  })

  it('omits optional fields that are not known', () => {
    const payload = buildSubmitPayload([{ listenedAt: listen.listenedAt, trackName: 'A', artistName: 'B' }])
    const metadata = payload.payload[0].track_metadata

    expect(metadata.release_name).toBeUndefined()
    expect(metadata.additional_info?.recording_mbid).toBeUndefined()
    expect(metadata.additional_info?.duration_ms).toBeUndefined()
  })
})

describe('submitNowPlaying', () => {
  it('sends listen_type playing_now without a timestamp', async () => {
    const fetchMock = mockFetch(200, { status: 'ok' })

    await listenBrainzProvider.submitNowPlaying(config, listen)

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.listen_type).toBe('playing_now')
    expect(body.payload[0].listened_at).toBeUndefined()
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.listenbrainz.org/1/submit-listens')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Token token')
  })
})

describe('error classification', () => {
  it('marks rate limiting as retryable', async () => {
    mockFetch(429, { error: 'slow down' })

    await expect(listenBrainzProvider.submitListens(config, [listen])).rejects.toMatchObject({
      status: 429,
      retryable: true
    })
  })

  it('marks server errors as retryable', async () => {
    mockFetch(503)

    await expect(listenBrainzProvider.submitListens(config, [listen])).rejects.toMatchObject({ retryable: true })
  })

  it('marks a rejected token as permanent', async () => {
    mockFetch(401, { error: 'invalid token' })

    await expect(listenBrainzProvider.submitListens(config, [listen])).rejects.toMatchObject({
      status: 401,
      retryable: false
    })
  })

  it('treats a network failure as retryable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))

    await expect(listenBrainzProvider.submitListens(config, [listen])).rejects.toMatchObject({
      status: 0,
      retryable: true
    })
  })
})

describe('validateToken', () => {
  it('returns the username for a valid token', async () => {
    mockFetch(200, { code: 200, message: 'Token valid.', valid: true, user_name: 'someone' })

    await expect(listenBrainzProvider.validateToken(config)).resolves.toEqual({ valid: true, username: 'someone' })
  })

  it('reports an invalid token instead of throwing', async () => {
    mockFetch(401, { error: 'invalid token' })

    await expect(listenBrainzProvider.validateToken(config)).resolves.toEqual({ valid: false })
  })

  it('rethrows when the service is unreachable', async () => {
    mockFetch(503)

    await expect(listenBrainzProvider.validateToken(config)).rejects.toBeInstanceOf(ScrobbleError)
  })
})

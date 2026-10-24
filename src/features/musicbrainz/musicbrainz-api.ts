import { Agent } from 'undici'
import { MUSICBRAINZ_API, COVERART_API, USER_AGENT } from './domain'

/**
 * Happy Eyeballs (RFC 8305) for every outbound MusicBrainz / Cover Art Archive request.
 *
 * Node's fetch (undici) otherwise commits to the first DNS answer — frequently the AAAA
 * record — and never falls back to IPv4. On a host without a working IPv6 route (e.g. an
 * IPv4-only docker bridge) each request then black-holes until it times out and surfaces as
 * a generic 502. Racing the A and AAAA addresses and keeping whichever connects first fixes
 * IPv4-only *and* IPv6-only deployments without hard-coding an address family. See #43.
 */
const dispatcher = new Agent({ connect: { autoSelectFamily: true } })

function mbFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  // `dispatcher` is a valid Node fetch (undici) option but absent from the DOM typings.
  return fetch(input, { ...init, dispatcher } as RequestInit)
}

interface MusicBrainzRequestOptions {
  params?: Record<string, string>
}

async function musicBrainzFetch<T>(path: string, options?: MusicBrainzRequestOptions): Promise<T> {
  const url = new URL(`${MUSICBRAINZ_API}${path}`)
  url.searchParams.set('fmt', 'json')
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await mbFetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) {
    throw new Error(`MusicBrainz request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function coverArtFetch<T>(path: string): Promise<T> {
  const response = await mbFetch(`${COVERART_API}${path}`, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) {
    throw new Error(`CoverArt request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function fetchImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await mbFetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'

  return { buffer: Buffer.from(arrayBuffer), contentType }
}

export const musicBrainzApi = {
  searchReleases: <T>(query: string, limit: number, offset = 0) =>
    musicBrainzFetch<T>('/release/', { params: { query, limit: String(limit), offset: String(offset) } }),
  searchRecordings: <T>(query: string, limit: number, offset: number) =>
    musicBrainzFetch<T>('/recording/', { params: { query, limit: String(limit), offset: String(offset) } }),
  getRelease: <T>(releaseId: string, inc: string) => musicBrainzFetch<T>(`/release/${releaseId}`, { params: { inc } }),
  getCoverArt: <T>(releaseId: string) => coverArtFetch<T>(`/release/${releaseId}`),
  fetchImage
}

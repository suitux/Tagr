import { MUSICBRAINZ_API, COVERART_API, USER_AGENT } from './domain'

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

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) {
    throw new Error(`MusicBrainz request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function coverArtFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${COVERART_API}${path}`, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) {
    throw new Error(`CoverArt request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function fetchImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
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
  searchReleases: <T>(query: string, limit: number) =>
    musicBrainzFetch<T>('/release/', { params: { query, limit: String(limit) } }),
  searchRecordings: <T>(query: string, limit: number) =>
    musicBrainzFetch<T>('/recording/', { params: { query, limit: String(limit) } }),
  getRelease: <T>(releaseId: string, inc: string) => musicBrainzFetch<T>(`/release/${releaseId}`, { params: { inc } }),
  getCoverArt: <T>(releaseId: string) => coverArtFetch<T>(`/release/${releaseId}`),
  fetchImage
}

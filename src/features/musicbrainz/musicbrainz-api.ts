import { CoverArtArchiveApi, MusicBrainzApi } from 'musicbrainz-api'

const APP_NAME = 'Tagr'
const APP_CONTACT_INFO = 'https://github.com/suitux/tagr'
const APP_VERSION = process.env.APP_VERSION ?? '0.0.0'

/** Tagr's own identification, also used for the image bytes the Cover Art Archive points at. */
const USER_AGENT = `${APP_NAME}/${APP_VERSION} (${APP_CONTACT_INFO})`

/**
 * Module-level singletons: the MusicBrainz client keeps the rate limiter in memory, so every
 * request has to go through the same instance instead of a new one per route call.
 */
const musicBrainz = new MusicBrainzApi({
  appName: APP_NAME,
  appVersion: APP_VERSION,
  appContactInfo: APP_CONTACT_INFO
})

const coverArtArchive = new CoverArtArchiveApi()

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
  searchReleases: (query: string, limit: number, offset = 0) => musicBrainz.search('release', { query, limit, offset }),
  searchRecordings: (query: string, limit: number, offset: number) =>
    musicBrainz.search('recording', { query, limit, offset }),
  getRelease: (releaseId: string) =>
    musicBrainz.lookup('release', releaseId, ['recordings', 'artist-credits', 'labels', 'release-groups']),
  getCoverArt: (releaseId: string) => coverArtArchive.getReleaseCovers(releaseId),
  fetchImage
}

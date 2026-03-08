import {
  MUSICBRAINZ_API,
  COVERART_API,
  USER_AGENT,
  type MusicBrainzSearchResponse,
  type MusicBrainzCoverArtResponse,
  type MusicBrainzCoverArtResult
} from './domain'

export async function searchRelease(artist: string, album: string): Promise<string | null> {
  const query = `release:${JSON.stringify(album)} AND artist:${JSON.stringify(artist)}`
  const url = `${MUSICBRAINZ_API}/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) return null

  const data = (await response.json()) as MusicBrainzSearchResponse
  if (!data.releases?.length) return null

  return data.releases[0].id
}

export async function fetchCoverArt(releaseId: string): Promise<MusicBrainzCoverArtResult | null> {
  const url = `${COVERART_API}/release/${releaseId}`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) return null

  const data = (await response.json()) as MusicBrainzCoverArtResponse
  const front = data.images?.find(img => img.front)
  if (!front) return null

  const imageUrl = front.thumbnails['500'] ?? front.thumbnails.large ?? front.image
  const imageResponse = await fetch(imageUrl, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!imageResponse.ok) return null

  const arrayBuffer = await imageResponse.arrayBuffer()
  const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg'

  return { buffer: Buffer.from(arrayBuffer), contentType }
}

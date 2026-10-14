import { joinMultiValue } from 'audiotagr/tags'
import {
  type MusicBrainzSearchResponse,
  type MusicBrainzCoverArtResponse,
  type MusicBrainzCoverArtResult,
  type MusicBrainzRecordingSearchResponse,
  type MusicBrainzReleaseDetail,
  type MusicBrainzMappedMetadata,
  type MusicBrainzRecording,
  type MusicBrainzReleaseSearchParams,
  type MusicBrainzReleaseSearchResponse,
  type MusicBrainzReleaseTrack,
  type MusicBrainzSearchParams,
  DEFAULT_MUSICBRAINZ_MATCH_MODE,
  MUSICBRAINZ_SEARCH_PAGE_SIZE
} from './domain'
import { musicBrainzApi } from './musicbrainz-api'

export async function searchReleaseId(artist: string, album: string): Promise<string | null> {
  const query = `release:${JSON.stringify(album)} AND artist:${JSON.stringify(artist)}`

  try {
    const data = await musicBrainzApi.searchReleases<MusicBrainzSearchResponse>(query, 5)
    if (!data.releases?.length) return null
    return data.releases[0].id
  } catch {
    return null
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isMbid(value: string): boolean {
  return UUID_REGEX.test(value.trim())
}

interface SearchRecordingsParams extends MusicBrainzSearchParams {
  limit?: number
  offset?: number
}

export function buildRecordingQuery({
  title,
  artist,
  album,
  year,
  mbid,
  matchMode = DEFAULT_MUSICBRAINZ_MATCH_MODE
}: MusicBrainzSearchParams): string {
  const textParts: string[] = []

  if (title) textParts.push(`recording:${JSON.stringify(title)}`)
  if (artist) textParts.push(`artist:${JSON.stringify(artist)}`)
  if (album) textParts.push(`release:${JSON.stringify(album)}`)

  const parts: string[] = []

  if (textParts.length) {
    const operator = matchMode === 'any' ? ' OR ' : ' AND '
    parts.push(textParts.length > 1 ? `(${textParts.join(operator)})` : textParts[0])
  }

  // year and mbid always narrow, in both modes — a bare `date:` or MBID clause OR'd with the
  // rest would drag in every recording of that year / of that artist.
  if (year) parts.push(`date:[${year} TO ${year}-12-31]`)
  // A single MBID can be a recording, a release or an artist — match all three so a
  // pasted id works whatever page the user copied it from.
  if (mbid && isMbid(mbid)) {
    const id = mbid.trim()
    parts.push(`(rid:${id} OR reid:${id} OR arid:${id})`)
  }

  return parts.join(' AND ')
}

export async function searchRecordings({
  limit = MUSICBRAINZ_SEARCH_PAGE_SIZE,
  offset = 0,
  ...params
}: SearchRecordingsParams): Promise<MusicBrainzRecordingSearchResponse> {
  const query = buildRecordingQuery(params)

  return musicBrainzApi.searchRecordings<MusicBrainzRecordingSearchResponse>(query, limit, offset)
}

export function buildReleaseQuery({ album, artist }: MusicBrainzReleaseSearchParams): string {
  const parts: string[] = []

  if (album?.trim()) parts.push(`release:${JSON.stringify(album.trim())}`)
  if (artist?.trim()) parts.push(`artist:${JSON.stringify(artist.trim())}`)

  return parts.join(' AND ')
}

interface SearchReleasesParams extends MusicBrainzReleaseSearchParams {
  limit?: number
  offset?: number
}

export async function searchReleases({
  limit = MUSICBRAINZ_SEARCH_PAGE_SIZE,
  offset = 0,
  ...params
}: SearchReleasesParams): Promise<MusicBrainzReleaseSearchResponse> {
  return musicBrainzApi.searchReleases<MusicBrainzReleaseSearchResponse>(buildReleaseQuery(params), limit, offset)
}

export async function fetchReleaseDetails(releaseId: string): Promise<MusicBrainzReleaseDetail> {
  return musicBrainzApi.getRelease<MusicBrainzReleaseDetail>(
    releaseId,
    'recordings+artist-credits+labels+release-groups'
  )
}

function formatArtistCredit(credits?: Array<{ name: string; joinphrase?: string }>): string | undefined {
  if (!credits?.length) return undefined
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

export function mapToSongMetadata(
  recording: MusicBrainzRecording,
  release: MusicBrainzReleaseDetail,
  recordingId: string
): MusicBrainzMappedMetadata {
  const result: MusicBrainzMappedMetadata = {}

  result.title = recording.title || undefined
  result.artist = formatArtistCredit(recording['artist-credit'])
  result.album = release.title || undefined
  result.albumArtist = formatArtistCredit(release['artist-credit'])

  if (release.date) {
    const yearNum = parseInt(release.date.substring(0, 4), 10)
    if (!isNaN(yearNum)) result.year = yearNum
  }

  // Find the track position for this recording in the release
  if (release.media) {
    for (const medium of release.media) {
      const track = medium.tracks?.find(t => t.recording.id === recordingId)
      if (track) {
        result.trackNumber = track.position
        result.trackTotal = medium['track-count']
        result.discNumber = medium.position
        break
      }
    }
    result.discTotal = release.media.length
  }

  if (release['label-info']?.[0]) {
    const labelInfo = release['label-info'][0]
    result.publisher = labelInfo.label?.name
    result.catalogNumber = labelInfo['catalog-number'] || undefined
  }

  result.barcode = release.barcode || undefined

  // Picard's RELEASETYPE: the primary type followed by any secondary ones, lowercased.
  const releaseGroup = release['release-group']
  const releaseTypes = [releaseGroup?.['primary-type'], ...(releaseGroup?.['secondary-types'] ?? [])]
  result.releaseType = joinMultiValue(releaseTypes.map(type => type?.toLowerCase())) ?? undefined

  if (release['release-group']?.['first-release-date']) {
    result.originalReleaseDate = release['release-group']['first-release-date']
  }

  if (recording.tags?.length) {
    result.genre = recording.tags
      .sort((a, b) => b.count - a.count)
      .map(t => t.name)
      .join(', ')
  }

  return result
}

/**
 * Every track of a release with the tags it would write. The track's own position wins over the
 * recording lookup in mapToSongMetadata, so a recording that appears twice on a release keeps
 * both of its positions. The track credit is used for the artist, which matters on compilations.
 */
export function mapReleaseTracks(release: MusicBrainzReleaseDetail): MusicBrainzReleaseTrack[] {
  const tracks: MusicBrainzReleaseTrack[] = []

  for (const medium of release.media ?? []) {
    for (const track of medium.tracks ?? []) {
      const recording: MusicBrainzRecording = {
        id: track.recording.id,
        title: track.title || track.recording.title || '',
        score: 0,
        'artist-credit': track['artist-credit'] ?? track.recording['artist-credit']
      }
      const mapped = mapToSongMetadata(recording, release, recording.id)

      tracks.push({
        id: track.id ?? `${medium.position}-${track.position}`,
        recordingId: recording.id,
        disc: medium.position,
        position: track.position,
        title: recording.title,
        length: track.length ?? track.recording.length ?? null,
        mapped: {
          ...mapped,
          trackNumber: track.position,
          trackTotal: medium['track-count'],
          discNumber: medium.position
        }
      })
    }
  }

  return tracks
}

export async function fetchCoverArt(releaseId: string): Promise<MusicBrainzCoverArtResult | null> {
  try {
    const data = await musicBrainzApi.getCoverArt<MusicBrainzCoverArtResponse>(releaseId)
    const front = data.images?.find(img => img.front)
    if (!front) return null

    const imageUrl = front.thumbnails['500'] ?? front.thumbnails.large ?? front.image
    return await musicBrainzApi.fetchImage(imageUrl)
  } catch {
    return null
  }
}

import {
  type MusicBrainzSearchResponse,
  type MusicBrainzCoverArtResponse,
  type MusicBrainzCoverArtResult,
  type MusicBrainzRecordingSearchResponse,
  type MusicBrainzReleaseDetail,
  type MusicBrainzMappedMetadata,
  type MusicBrainzRecording
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

interface SearchRecordingsParams {
  title: string
  album: string
}

export async function searchRecordings({
  title,
  album
}: SearchRecordingsParams): Promise<MusicBrainzRecordingSearchResponse> {
  const parts: string[] = []
  if (title) parts.push(`recording:${JSON.stringify(title)}`)
  if (album) parts.push(`release:${JSON.stringify(album)}`)
  const query = parts.join(' AND ')

  return musicBrainzApi.searchRecordings<MusicBrainzRecordingSearchResponse>(query, 10)
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

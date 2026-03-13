export const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2'
export const COVERART_API = 'https://coverartarchive.org'
export const USER_AGENT = `Tagr/${process.env.APP_VERSION} (https://github.com/suitux/tagr)`

export interface MusicBrainzRelease {
  id: string
  title: string
  score: number
}

export interface MusicBrainzSearchResponse {
  releases: MusicBrainzRelease[]
}

export interface MusicBrainzCoverArtImage {
  front: boolean
  image: string
  thumbnails: {
    small?: string
    large?: string
    250?: string
    500?: string
    1200?: string
  }
}

export interface MusicBrainzCoverArtResponse {
  images: MusicBrainzCoverArtImage[]
}

export interface MusicBrainzCoverArtResult {
  buffer: Buffer
  contentType: string
}

export interface MusicBrainzArtistCredit {
  name: string
  joinphrase?: string
}

export interface MusicBrainzRecordingRelease {
  id: string
  title: string
  date?: string
  country?: string
  'artist-credit'?: MusicBrainzArtistCredit[]
  'release-group'?: {
    'primary-type'?: string
    'first-release-date'?: string
  }
}

export interface MusicBrainzRecording {
  id: string
  title: string
  score: number
  'artist-credit'?: MusicBrainzArtistCredit[]
  releases?: MusicBrainzRecordingRelease[]
  tags?: Array<{ name: string; count: number }>
}

export interface MusicBrainzRecordingSearchResponse {
  recordings: MusicBrainzRecording[]
}

export interface MusicBrainzReleaseMedia {
  position: number
  'track-count': number
  tracks?: Array<{
    position: number
    title: string
    recording: { id: string }
  }>
}

export interface MusicBrainzReleaseDetail {
  id: string
  title: string
  date?: string
  country?: string
  barcode?: string
  'artist-credit'?: MusicBrainzArtistCredit[]
  'label-info'?: Array<{
    'catalog-number'?: string
    label?: { name: string }
  }>
  media?: MusicBrainzReleaseMedia[]
  'release-group'?: {
    'primary-type'?: string
    'first-release-date'?: string
  }
}

export interface MusicBrainzMappedMetadata {
  title?: string
  artist?: string
  album?: string
  albumArtist?: string
  year?: number
  trackNumber?: number
  trackTotal?: number
  discNumber?: number
  discTotal?: number
  publisher?: string
  catalogNumber?: string
  barcode?: string
  originalReleaseDate?: string
  genre?: string
}

export const MUSIC_BRAINZ_FIELDS: (keyof MusicBrainzMappedMetadata)[] = [
  'title',
  'artist',
  'album',
  'albumArtist',
  'year',
  'trackNumber',
  'trackTotal',
  'discNumber',
  'discTotal',
  'publisher',
  'catalogNumber',
  'barcode',
  'originalReleaseDate',
  'genre'
]

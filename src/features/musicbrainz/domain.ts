import type {
  IArtistCredit,
  IRecordingList,
  IRecordingMatch,
  IRelease,
  IReleaseList,
  IReleaseMatch
} from 'musicbrainz-api'

export const COVERART_API = 'https://coverartarchive.org'

/** Response and entity types come from `musicbrainz-api`, which keeps them in sync with the web service. */
export interface MusicBrainzCoverArtResult {
  buffer: Buffer
  contentType: string
}

export type MusicBrainzArtistCredit = IArtistCredit

export type MusicBrainzRecordingRelease = IRelease

export type MusicBrainzRecording = IRecordingMatch

export type MusicBrainzRecordingSearchResponse = IRecordingList

export type MusicBrainzMatchMode = 'all' | 'any'

export const MUSICBRAINZ_MATCH_MODES: MusicBrainzMatchMode[] = ['any', 'all']

export const DEFAULT_MUSICBRAINZ_MATCH_MODE: MusicBrainzMatchMode = 'any'

/** The inputs the search form can show, in the order they are laid out. */
export const MUSICBRAINZ_SEARCH_FIELDS = ['title', 'artist', 'album', 'year', 'mbid'] as const

export type MusicBrainzSearchField = (typeof MUSICBRAINZ_SEARCH_FIELDS)[number]

/** Free-text search inputs shared by the search form, the API route and the service. */
export interface MusicBrainzSearchParams {
  title?: string
  artist?: string
  album?: string
  year?: number
  mbid?: string
  matchMode?: MusicBrainzMatchMode
}

export const MUSICBRAINZ_SEARCH_PAGE_SIZE = 25
export const MUSICBRAINZ_SEARCH_MAX_LIMIT = 100

export type MusicBrainzReleaseDetail = IRelease

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
  releaseType?: string
  barcode?: string
  originalReleaseDate?: string
  genre?: string
}

/** A release as the release search returns it - enough to tell editions apart. */
export type MusicBrainzReleaseSearchResult = IReleaseMatch

export type MusicBrainzReleaseSearchResponse = IReleaseList

/** Album-level release search used by the bulk lookup. */
export interface MusicBrainzReleaseSearchParams {
  album?: string
  artist?: string
}

/** One track of a release together with the tags it would write. */
export interface MusicBrainzReleaseTrack {
  id: string
  recordingId: string
  disc: number
  position: number
  title: string
  /** Milliseconds; null when MusicBrainz does not know it. */
  length: number | null
  mapped: MusicBrainzMappedMetadata
}

/** The most songs one bulk lookup works on - it matches against a single release. */
export const BULK_MUSICBRAINZ_LIMIT = 500

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
  'releaseType',
  'barcode',
  'originalReleaseDate',
  'genre'
]

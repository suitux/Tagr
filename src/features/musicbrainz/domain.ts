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

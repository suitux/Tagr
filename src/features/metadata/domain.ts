import type { AudioMetadataPatch, TagKeyValue, TagPicture } from 'audiotagr/tags'

/**
 * Fields the editor can change. Everything writable to the file comes from
 * `audiotagr`; the rest are playback settings Tagr stores only in the database.
 * `customMetadata` is the API/UI name for the package's `customTags`.
 */
export interface SongMetadataUpdate extends Omit<AudioMetadataPatch, 'customTags'> {
  customMetadata?: MetadataInput[]
  volume?: number
  startTime?: number
  stopTime?: number
  gapless?: boolean
}

export interface ScanResult {
  addedFiles: string[]
  updatedFiles: string[]
  deletedFiles: string[]
  skippedFiles: string[]
  errors: Array<{ path: string; error: string }>
}

export interface ScanResultResponse {
  added: { count: number; files: string[] }
  updated: { count: number; files: string[] }
  deleted: { count: number; files: string[] }
  skipped: { count: number }
  errors: Array<{ path: string; error: string }>
}

export const SCAN_FILE_LIST_LIMIT = 500

export type { ScanProgress } from 'audiotagr'

/** Extended tag rows persisted in `SongMetadata`. */
export type MetadataInput = TagKeyValue

/** Album art rows persisted in `SongPicture`. */
export type PictureInput = TagPicture

/** A song row as produced by a scan, with its nested relations. */
export interface SongCreateInput {
  filePath: string
  fileName: string
  folderPath: string
  extension: string
  fileSize: number
  createdAt: Date | null
  modifiedAt: Date | null

  title: string | null
  artist: string | null
  sortArtist: string | null
  album: string | null
  sortAlbum: string | null
  trackNumber: number | null
  trackTotal: number | null
  discNumber: number | null
  discTotal: number | null
  year: number | null
  bpm: number | null
  genre: string | null
  style: string | null
  albumArtist: string | null
  sortAlbumArtist: string | null
  composer: string | null
  conductor: string | null
  comment: string | null
  grouping: string | null
  publisher: string | null
  catalogNumber: string | null
  lyricist: string | null
  barcode: string | null
  work: string | null
  originalReleaseDate: Date | null
  copyright: string | null
  rating: number | null
  lyrics: string | null
  compilation: boolean
  volume: number | null
  startTime: number | null
  stopTime: number | null
  gapless: boolean

  dateAdded: Date | null

  duration: number | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  bitsPerSample: number | null
  codec: string | null
  lossless: boolean
  encoder: string | null

  metadata?: MetadataInput[]
  pictures?: PictureInput[]
}

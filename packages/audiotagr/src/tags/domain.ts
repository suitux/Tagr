import { TagKeyValue, TagPicture } from '../shared/domain'

/** A single native tag entry as exposed by the underlying parser. */
export interface NativeTag {
  id: string
  value: unknown
}

/** Native tags grouped by tag format (`ID3v2.4`, `vorbis`, `iTunes MP4`…). */
export type NativeTagMap = Record<string, NativeTag[]>

/** Filesystem facts about the audio file, independent of its tags. */
export interface AudioFileInfo {
  filePath: string
  fileName: string
  folderPath: string
  extension: string
  fileSize: number
  createdAt: Date | null
  modifiedAt: Date | null
}

/**
 * Format-agnostic tag fields. Multi-value fields (artist, genre, composer…) are
 * flattened with {@link FIELD_MULTI_VALUE_SEPARATOR}.
 */
export interface AudioTags {
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
  /** Raw tag value (`YYYY`, `YYYY-MM-DD`…); parsing is left to the consumer. */
  originalReleaseDate: string | null
  copyright: string | null
  /** Normalized to 0-100 regardless of the format's native scale. */
  rating: number | null
  lyrics: string | null
  compilation: boolean
  gapless: boolean
}

/** Technical properties of the audio stream. */
export interface AudioProperties {
  duration: number | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  bitsPerSample: number | null
  codec: string | null
  lossless: boolean
  encoder: string | null
}

/** Everything {@link readAudioMetadata} knows about a file. */
export interface AudioFileMetadata extends AudioFileInfo, AudioTags, AudioProperties {
  /** Native tags with no dedicated field, keyed as `format:tagId[:description]`. */
  customTags: TagKeyValue[]
  pictures: TagPicture[]
}

/**
 * Fields {@link writeAudioMetadata} can write. Every field is optional: only the
 * ones present are touched, and an empty string / `null` clears the tag.
 */
export interface AudioMetadataPatch extends Partial<Omit<AudioTags, 'gapless'>> {
  /** Custom tags to write. A `null` value removes the tag from every format. */
  customTags?: TagKeyValue[]
}

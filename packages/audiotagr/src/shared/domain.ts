import { MUSIC_EXTENSIONS } from './constants'

export type MusicExtension = (typeof MUSIC_EXTENSIONS)[number]

/** An extended/native tag that has no dedicated field in {@link AudioTags}. */
export interface TagKeyValue {
  key: string
  value: string | null
}

/** An embedded picture (cover art). */
export interface TagPicture {
  type: string | null
  format: string | null
  description: string | null
  data: Buffer | null
}

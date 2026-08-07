import {
  ApeTag,
  AsfTag,
  File,
  Id3v2Tag,
  Mpeg4AppleTag,
  Tag,
  TagTypes,
  XiphComment
} from 'node-taglib-sharp'

export type TagLibFile = ReturnType<typeof File.createFromPath>

/**
 * An open file plus every native tag it actually carries. Writers fan a single
 * logical field out to whichever of these are present, because a file can hold
 * several tag types at once (e.g. an MP3 with both ID3v2 and APEv2).
 */
export interface TagContext {
  file: TagLibFile
  /** Aggregate tag: convenience properties routed to every native tag. */
  tag: Tag
  id3v2: Id3v2Tag | null
  xiph: XiphComment | null
  apple: Mpeg4AppleTag | null
  asf: AsfTag | null
  ape: ApeTag | null
}

export function getTagContext(file: TagLibFile): TagContext {
  return {
    file,
    tag: file.tag,
    id3v2: file.getTag(TagTypes.Id3v2, false) as Id3v2Tag | null,
    xiph: file.getTag(TagTypes.Xiph, false) as XiphComment | null,
    apple: file.getTag(TagTypes.Apple, false) as Mpeg4AppleTag | null,
    asf: file.getTag(TagTypes.Asf, false) as AsfTag | null,
    ape: file.getTag(TagTypes.Ape, false) as ApeTag | null
  }
}

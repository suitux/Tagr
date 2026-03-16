import {
  File,
  Tag,
  TagTypes,
  Id3v2Tag,
  Id3v2FrameClassType,
  Id3v2FrameIdentifiers,
  Id3v2UserTextInformationFrame,
  XiphComment,
  Mpeg4AppleTag,
  AsfTag,
  ApeTag,
  ByteVector,
  Picture,
  PictureType,
  Id3v2PopularimeterFrame
} from 'node-taglib-sharp'
import { SongMetadataUpdate } from '@/features/metadata/domain'

interface TagContext {
  file: ReturnType<typeof File.createFromPath>
  tag: Tag
  id3v2: Id3v2Tag | null
  xiph: XiphComment | null
  apple: Mpeg4AppleTag | null
  asf: AsfTag | null
  ape: ApeTag | null
}

function getTagContext(file: ReturnType<typeof File.createFromPath>): TagContext {
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

// --- Low-level helpers ---

function setId3v2Txxx(id3v2: Id3v2Tag, description: string, value: string | undefined) {
  const existing = id3v2
    .getFramesByIdentifier<Id3v2UserTextInformationFrame>(
      Id3v2FrameClassType.UserTextInformationFrame,
      Id3v2FrameIdentifiers.TXXX
    )
    .filter(f => f.description?.toUpperCase() === description.toUpperCase())
  for (const f of existing) {
    id3v2.removeFrame(f)
  }

  if (value) {
    const frame = Id3v2UserTextInformationFrame.fromDescription(description)
    frame.text = [value]
    id3v2.addFrame(frame)
  }
}

// ASF descriptor names that music-metadata expects
const ASF_NATIVE_FIELD_MAP: Record<string, string> = {
  LYRICIST: 'WM/Writer',
  BARCODE: 'WM/Barcode',
  CATALOGNUMBER: 'WM/CatalogNo',
  WORK: 'WM/Work',
  ORIGINALDATE: 'WM/OriginalReleaseTime',
  RATING: 'WM/SharedUserRating'
}

// --- Unified write helpers ---

/** Write a field to all non-ID3v2 native tags (Xiph, Apple, ASF, APE) */
function writeToNonId3v2(ctx: TagContext, key: string, value: string | undefined) {
  if (ctx.xiph) {
    if (value) {
      ctx.xiph.setFieldAsStrings(key.toUpperCase(), value)
    } else {
      ctx.xiph.removeField(key.toUpperCase())
    }
  }

  if (ctx.apple) {
    if (value) {
      ctx.apple.setItunesStrings('com.apple.iTunes', key, value)
    } else {
      ctx.apple.setItunesStrings('com.apple.iTunes', key)
    }
  }

  if (ctx.asf) {
    const descriptor = ASF_NATIVE_FIELD_MAP[key.toUpperCase()]
    if (descriptor) {
      ctx.asf.setDescriptorString(value ?? '', descriptor)
    }
  }

  if (ctx.ape) {
    ctx.ape.setStringValue(key, value ?? '')
  }
}

/** Write a field as TXXX in ID3v2 + all other native formats */
function writeToAllNativeTags(ctx: TagContext, key: string, value: string | undefined) {
  if (ctx.id3v2) {
    setId3v2Txxx(ctx.id3v2, key, value)
  }
  writeToNonId3v2(ctx, key, value)
}

// --- Special ID3v2 fields ---

function writeId3v2OriginalDate(id3v2: Id3v2Tag, value: string | undefined) {
  if (value) {
    id3v2.setTextFrame(Id3v2FrameIdentifiers.TDOR, value)
  } else {
    id3v2.setTextFrame(Id3v2FrameIdentifiers.TDOR)
  }
}

function writeId3v2Rating(id3v2: Id3v2Tag, rating: number | null | undefined) {
  const existingPopm = id3v2.getFramesByIdentifier<Id3v2PopularimeterFrame>(
    Id3v2FrameClassType.PopularimeterFrame,
    Id3v2FrameIdentifiers.POPM
  )
  for (const f of existingPopm) {
    id3v2.removeFrame(f)
  }

  if (rating !== null && rating !== undefined && rating > 0) {
    const popmRating = Math.round((rating / 100) * 254 + 1)
    const frame = Id3v2PopularimeterFrame.fromUser('')
    frame.rating = Math.min(255, Math.max(1, popmRating))
    id3v2.addFrame(frame)
  }
}

// --- Convenience fields ---

function writeConvenienceFields(ctx: TagContext, metadata: SongMetadataUpdate) {
  const { tag } = ctx

  if (metadata.title !== undefined) tag.title = metadata.title
  if (metadata.artist !== undefined) tag.performers = metadata.artist ? [metadata.artist] : []
  if (metadata.sortArtist !== undefined) tag.performersSort = metadata.sortArtist ? [metadata.sortArtist] : []
  if (metadata.album !== undefined) tag.album = metadata.album
  if (metadata.sortAlbum !== undefined) tag.albumSort = metadata.sortAlbum
  if (metadata.trackNumber !== undefined) tag.track = metadata.trackNumber
  if (metadata.trackTotal !== undefined) tag.trackCount = metadata.trackTotal
  if (metadata.discNumber !== undefined) tag.disc = metadata.discNumber
  if (metadata.discTotal !== undefined) tag.discCount = metadata.discTotal
  if (metadata.year !== undefined) tag.year = metadata.year
  if (metadata.bpm !== undefined) tag.beatsPerMinute = metadata.bpm
  if (metadata.genre !== undefined) tag.genres = metadata.genre ? [metadata.genre] : []
  if (metadata.albumArtist !== undefined) tag.albumArtists = metadata.albumArtist ? [metadata.albumArtist] : []
  if (metadata.sortAlbumArtist !== undefined)
    tag.albumArtistsSort = metadata.sortAlbumArtist ? [metadata.sortAlbumArtist] : []
  if (metadata.composer !== undefined) tag.composers = metadata.composer ? [metadata.composer] : []
  if (metadata.conductor !== undefined) tag.conductor = metadata.conductor
  if (metadata.comment !== undefined) tag.comment = metadata.comment
  if (metadata.grouping !== undefined) tag.grouping = metadata.grouping
  if (metadata.copyright !== undefined) tag.copyright = metadata.copyright
  if (metadata.lyrics !== undefined) tag.lyrics = metadata.lyrics
  if (metadata.compilation !== undefined) tag.isCompilation = metadata.compilation
}

// --- ASF overrides for fields where convenience properties write wrong descriptors ---

function writeAsfOverrides(ctx: TagContext, metadata: SongMetadataUpdate) {
  if (!ctx.asf) return

  if (metadata.comment !== undefined) {
    ctx.asf.setDescriptorString(metadata.comment ?? '', 'Description')
  }
  if (metadata.trackTotal !== undefined) {
    const trackNo = metadata.trackNumber ?? ctx.file.tag.track ?? 0
    if (trackNo > 0) {
      ctx.asf.setDescriptorString(`${trackNo}/${metadata.trackTotal}`, 'WM/TrackNumber')
    }
  }
  if (metadata.compilation !== undefined) {
    ctx.asf.setDescriptorString(metadata.compilation ? '1' : '0', 'WM/IsCompilation')
  }
}

// --- Native fields (no convenience property) ---

function writeNativeFields(ctx: TagContext, metadata: SongMetadataUpdate) {
  // Lyricist: ID3v2 uses standard TEXT frame, others use TXXX-style
  if (metadata.lyricist !== undefined) {
    if (ctx.id3v2) {
      ctx.id3v2.setTextFrame(Id3v2FrameIdentifiers.TEXT, ...(metadata.lyricist ? [metadata.lyricist] : []))
    }
    writeToNonId3v2(ctx, 'LYRICIST', metadata.lyricist)
  }

  // Simple TXXX fields → all native formats
  if (metadata.barcode !== undefined) writeToAllNativeTags(ctx, 'BARCODE', metadata.barcode)
  if (metadata.catalogNumber !== undefined) writeToAllNativeTags(ctx, 'CATALOGNUMBER', metadata.catalogNumber)
  if (metadata.work !== undefined) writeToAllNativeTags(ctx, 'WORK', metadata.work)

  // Publisher: convenience property + native overrides for Xiph (LABEL), Apple, ASF
  if (metadata.publisher !== undefined) {
    ctx.tag.publisher = metadata.publisher
    if (ctx.xiph) {
      if (metadata.publisher) {
        ctx.xiph.setFieldAsStrings('LABEL', metadata.publisher)
      } else {
        ctx.xiph.removeField('LABEL')
      }
    }
    if (ctx.apple) {
      ctx.apple.setItunesStrings('com.apple.iTunes', 'LABEL', metadata.publisher ?? '')
    }
    if (ctx.asf) {
      ctx.asf.setDescriptorString(metadata.publisher ?? '', 'WM/Publisher')
    }
  }

  // Original release date: ID3v2 uses TDOR frame, others use native field
  if (metadata.originalReleaseDate !== undefined) {
    if (ctx.id3v2) writeId3v2OriginalDate(ctx.id3v2, metadata.originalReleaseDate)
    writeToNonId3v2(ctx, 'ORIGINALDATE', metadata.originalReleaseDate)
  }

  // Rating: ID3v2 uses POPM frame, others use native field
  if (metadata.rating !== undefined) {
    if (ctx.id3v2) writeId3v2Rating(ctx.id3v2, metadata.rating)
    writeToNonId3v2(ctx, 'RATING', metadata.rating?.toString())
  }
}

// --- Custom key-value metadata ---

function writeCustomTags(ctx: TagContext, customMetadata: { key: string; value: string | null }[]) {
  for (const { key, value } of customMetadata) {
    const upperKey = key.toUpperCase()
    writeToAllNativeTags(ctx, upperKey, value ?? undefined)
  }
}

// --- Public API ---

export async function writePictureToFile(filePath: string, imageBuffer: Buffer, mimeType: string): Promise<void> {
  const file = File.createFromPath(filePath)

  try {
    const picture = Picture.fromData(ByteVector.fromByteArray(imageBuffer))
    picture.mimeType = mimeType
    picture.type = PictureType.FrontCover
    file.tag.pictures = [picture]
    file.save()
  } finally {
    file.dispose()
  }
}

export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const file = File.createFromPath(filePath)

  try {
    const ctx = getTagContext(file)

    writeConvenienceFields(ctx, metadata)
    writeAsfOverrides(ctx, metadata)
    writeNativeFields(ctx, metadata)

    if (metadata.customMetadata) {
      writeCustomTags(ctx, metadata.customMetadata)
    }

    file.save()
  } finally {
    file.dispose()
  }
}

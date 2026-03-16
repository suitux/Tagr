import {
  File,
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
  PictureType
} from 'node-taglib-sharp'
import { SongMetadataUpdate } from '@/features/metadata/domain'

// --- Native tag helpers ---

function setId3v2Txxx(id3v2: Id3v2Tag, description: string, value: string | undefined) {
  // Remove existing TXXX with this description
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

// tag.publisher doesn't work correctly for Xiph, Apple, or ASF — write natively
// using the field names that music-metadata maps to common.label
function writePublisher(file: ReturnType<typeof File.createFromPath>, value: string) {
  file.tag.publisher = value

  const xiph = file.getTag(TagTypes.Xiph, false) as XiphComment | null
  if (xiph) {
    if (value) {
      xiph.setFieldAsStrings('LABEL', value)
    } else {
      xiph.removeField('LABEL')
    }
  }

  const apple = file.getTag(TagTypes.Apple, false) as Mpeg4AppleTag | null
  if (apple) {
    apple.setItunesStrings('com.apple.iTunes', 'LABEL', value ?? '')
  }

  const asf = file.getTag(TagTypes.Asf, false) as AsfTag | null
  if (asf) {
    asf.setDescriptorString(value ?? '', 'WM/Publisher')
  }
}

// ASF descriptor names that music-metadata expects, keyed by our internal field name
const ASF_NATIVE_FIELD_MAP: Record<string, string> = {
  LYRICIST: 'WM/Writer',
  BARCODE: 'WM/Barcode',
  CATALOGNUMBER: 'WM/CatalogNo',
  WORK: 'WM/Work',
  ORIGINALDATE: 'WM/OriginalReleaseTime',
  RATING: 'WM/SharedUserRating'
}

// Fields where node-taglib-sharp convenience properties write to wrong ASF descriptors
function writeAsfOverrides(file: ReturnType<typeof File.createFromPath>, metadata: SongMetadataUpdate) {
  const asf = file.getTag(TagTypes.Asf, false) as AsfTag | null
  if (!asf) return

  // tag.comment writes WM/Text, but music-metadata reads Description
  if (metadata.comment !== undefined) {
    asf.setDescriptorString(metadata.comment ?? '', 'Description')
  }
  // tag.trackCount writes TrackTotal, but music-metadata only reads WM/TrackNumber
  // Write as "trackNumber/trackTotal" format that normalizeTrack() can parse
  if (metadata.trackTotal !== undefined) {
    const trackNo = metadata.trackNumber ?? file.tag.track ?? 0
    if (trackNo > 0) {
      asf.setDescriptorString(`${trackNo}/${metadata.trackTotal}`, 'WM/TrackNumber')
    }
  }
  // tag.isCompilation is a no-op for ASF
  if (metadata.compilation !== undefined) {
    asf.setDescriptorString(metadata.compilation ? '1' : '0', 'WM/IsCompilation')
  }
}

function writeNativeTags(file: ReturnType<typeof File.createFromPath>, metadata: SongMetadataUpdate) {
  // Fields that need native tag writing (no convenience property in node-taglib-sharp)
  const nativeFields: { key: string; value: string | undefined; id3v2FrameId?: string }[] = [
    { key: 'LYRICIST', value: metadata.lyricist, id3v2FrameId: 'TEXT' },
    { key: 'BARCODE', value: metadata.barcode },
    { key: 'CATALOGNUMBER', value: metadata.catalogNumber },
    { key: 'WORK', value: metadata.work },
    { key: 'ORIGINALDATE', value: metadata.originalReleaseDate }
  ]

  if (metadata.rating !== undefined) {
    nativeFields.push({ key: 'RATING', value: metadata.rating?.toString() })
  }

  // Filter to only fields that were actually provided
  const fieldsToWrite = nativeFields.filter(f => f.value !== undefined)
  if (fieldsToWrite.length === 0) return

  // ID3v2 (MP3, AIFF)
  const id3v2 = file.getTag(TagTypes.Id3v2, false) as Id3v2Tag | null
  if (id3v2) {
    for (const field of fieldsToWrite) {
      if (field.id3v2FrameId === 'TEXT') {
        // TEXT is a standard frame (lyricist)
        id3v2.setTextFrame(Id3v2FrameIdentifiers.TEXT, ...(field.value ? [field.value] : []))
      } else {
        // Everything else goes in TXXX
        setId3v2Txxx(id3v2, field.key, field.value)
      }
    }
  }

  // Vorbis comments (FLAC, OGG)
  const xiph = file.getTag(TagTypes.Xiph, false) as XiphComment | null
  if (xiph) {
    for (const field of fieldsToWrite) {
      if (field.value) {
        xiph.setFieldAsStrings(field.key.toUpperCase(), field.value)
      } else {
        xiph.removeField(field.key.toUpperCase())
      }
    }
  }

  // Apple/iTunes (M4A, AAC)
  const apple = file.getTag(TagTypes.Apple, false) as Mpeg4AppleTag | null
  if (apple) {
    for (const field of fieldsToWrite) {
      if (field.value) {
        apple.setItunesStrings('com.apple.iTunes', field.key, field.value)
      } else {
        apple.setItunesStrings('com.apple.iTunes', field.key)
      }
    }
  }

  // ASF (WMA)
  const asf = file.getTag(TagTypes.Asf, false) as AsfTag | null
  if (asf) {
    for (const field of fieldsToWrite) {
      const descriptor = ASF_NATIVE_FIELD_MAP[field.key]
      if (descriptor) {
        asf.setDescriptorString(field.value ?? '', descriptor)
      }
    }
  }

  // APEv2
  const ape = file.getTag(TagTypes.Ape, false) as ApeTag | null
  if (ape) {
    for (const field of fieldsToWrite) {
      ape.setStringValue(field.key, field.value ?? '')
    }
  }
}

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

function writeCustomTags(
  file: ReturnType<typeof File.createFromPath>,
  customMetadata: { key: string; value: string | null }[]
) {
  for (const { key, value } of customMetadata) {
    const upperKey = key.toUpperCase()

    // ID3v2 (MP3, AIFF) — write as TXXX frame
    const id3v2 = file.getTag(TagTypes.Id3v2, false) as Id3v2Tag | null
    if (id3v2) {
      if (value) {
        setId3v2Txxx(id3v2, upperKey, value)
      } else {
        setId3v2Txxx(id3v2, upperKey, undefined)
      }
    }

    // Vorbis comments (FLAC, OGG)
    const xiph = file.getTag(TagTypes.Xiph, false) as XiphComment | null
    if (xiph) {
      if (value) {
        xiph.setFieldAsStrings(upperKey, value)
      } else {
        xiph.removeField(upperKey)
      }
    }

    // Apple/iTunes (M4A, AAC)
    const apple = file.getTag(TagTypes.Apple, false) as Mpeg4AppleTag | null
    if (apple) {
      if (value) {
        apple.setItunesStrings('com.apple.iTunes', upperKey, value)
      } else {
        apple.setItunesStrings('com.apple.iTunes', upperKey)
      }
    }

    // ASF (WMA)
    const asf = file.getTag(TagTypes.Asf, false) as AsfTag | null
    if (asf) {
      asf.setDescriptorString(value ?? '', upperKey)
    }

    // APEv2
    const ape = file.getTag(TagTypes.Ape, false) as ApeTag | null
    if (ape) {
      ape.setStringValue(upperKey, value ?? '')
    }
  }
}

export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const file = File.createFromPath(filePath)

  try {
    const tag = file.tag

    // Fields with convenience properties
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
    if (metadata.publisher !== undefined) writePublisher(file, metadata.publisher)
    if (metadata.copyright !== undefined) tag.copyright = metadata.copyright
    if (metadata.lyrics !== undefined) tag.lyrics = metadata.lyrics
    if (metadata.compilation !== undefined) tag.isCompilation = metadata.compilation

    // Fix fields where ASF convenience properties don't match music-metadata expectations
    writeAsfOverrides(file, metadata)

    // Fields that require native tag writing
    writeNativeTags(file, metadata)

    // Custom key-value tags
    if (metadata.customMetadata) {
      writeCustomTags(file, metadata.customMetadata)
    }

    file.save()
  } finally {
    file.dispose()
  }
}

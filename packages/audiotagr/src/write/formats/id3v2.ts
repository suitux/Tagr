import {
  Id3v2FrameClassType,
  Id3v2FrameIdentifiers,
  Id3v2PopularimeterFrame,
  Id3v2Tag,
  Id3v2UserTextInformationFrame
} from 'node-taglib-sharp'

/** Set (or remove, when `value` is empty) a `TXXX:<description>` user text frame. */
export function setTxxx(id3v2: Id3v2Tag, description: string, value: string | undefined) {
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

/** Lyricist lives in the standard `TEXT` frame rather than a TXXX frame. */
export function setLyricist(id3v2: Id3v2Tag, value: string | undefined) {
  id3v2.setTextFrame(Id3v2FrameIdentifiers.TEXT, ...(value ? [value] : []))
}

/** Original release date goes in `TDOR`. */
export function setOriginalDate(id3v2: Id3v2Tag, value: string | undefined) {
  if (value) {
    id3v2.setTextFrame(Id3v2FrameIdentifiers.TDOR, value)
  } else {
    id3v2.setTextFrame(Id3v2FrameIdentifiers.TDOR)
  }
}

/** Rating (0-100) is stored as a `POPM` frame on the 1-255 scale. */
export function setRating(id3v2: Id3v2Tag, rating: number | null | undefined) {
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

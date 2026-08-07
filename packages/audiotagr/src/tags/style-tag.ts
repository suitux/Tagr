import { NativeTag, NativeTagMap } from './domain'

// ID3v2.2 uses shorter frame IDs (TXX instead of TXXX). For these frames,
// the description is embedded in the value as "DESCRIPTION\0VALUE".
export const TXXX_SHORT_IDS = new Set(['TXX', 'TXXX'])

// A Style tag surfaces under different native IDs per format:
//   Vorbis/APE  → `STYLE`
//   ID3v2.4     → `TXXX:STYLE`
//   iTunes/M4A  → `----:com.apple.iTunes:STYLE`
//   ASF/WMA     → `STYLE`
//   ID3v2.2     → `TXX` frame with value "STYLE\0value"
// Every case ends in a `STYLE` segment (after splitting the ID on ':'), except
// the ID3v2.2 embedded form which we unpack from the value. Returns the Style
// string for a native tag, or undefined when the tag is not a Style tag.
export function styleValueFromTag(tag: NativeTag): string | undefined {
  if (typeof tag.value !== 'string') return undefined
  const upperId = tag.id.toUpperCase()

  // Cross-format: last ':'-segment is the descriptor/field name.
  if (upperId.split(':').pop() === 'STYLE') return tag.value

  // ID3v2.2 `TXX` embeds the description in the value as "STYLE\0value".
  if (TXXX_SHORT_IDS.has(upperId) && tag.value.includes('\0')) {
    const nullIndex = tag.value.indexOf('\0')
    if (tag.value.substring(0, nullIndex).toUpperCase() === 'STYLE') {
      let text = tag.value.substring(nullIndex + 1)
      if (text.charCodeAt(0) === 0xfeff) text = text.substring(1)
      return text
    }
  }

  return undefined
}

// Tag parsers map STYLE frames to the SAME common field as the real genre frame
// (`TCON`/`GENRE`), silently merging Style into Genre, e.g. `Pop Punk;acoustic`.
// Collecting the raw STYLE values from the native frames lets the reader (a)
// expose Style as its own field and (b) strip those values back out of the
// genre, keeping Genre = the genre frame only.
export function getNativeStyleValues(native: NativeTagMap | undefined): string[] {
  const styles: string[] = []
  if (!native) return styles

  for (const tags of Object.values(native)) {
    for (const tag of tags) {
      const value = styleValueFromTag(tag)
      if (value !== undefined) styles.push(value)
    }
  }

  return styles
}

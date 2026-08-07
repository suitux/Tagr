import { TagKeyValue } from '../shared/domain'
import { NativeTagMap } from '../tags/domain'
import { isMappedNativeTag } from '../tags/native-tags'
import { TXXX_SHORT_IDS } from '../tags/style-tag'

/** First string value of a native tag, searched across every tag format. */
export function getNativeTagValue(native: NativeTagMap | undefined, tagName: string): string | undefined {
  if (!native) return undefined

  for (const tags of Object.values(native)) {
    const tag = tags.find(t => t.id.toUpperCase() === tagName.toUpperCase())
    if (tag && typeof tag.value === 'string') return tag.value
  }

  return undefined
}

/**
 * Native tags with no dedicated field, keyed as `format:tagId` (or
 * `format:TXX:description` once an ID3v2.2 user frame is unpacked).
 */
export function mapCustomTags(native: NativeTagMap | undefined): TagKeyValue[] {
  const customTags: TagKeyValue[] = []
  if (!native) return customTags

  for (const [formatType, tags] of Object.entries(native)) {
    for (const tag of tags) {
      if (typeof tag.value !== 'string' || isMappedNativeTag(tag.id, tag.value)) continue

      let key = `${formatType}:${tag.id}`
      let value = tag.value

      // TXX (ID3v2.2) embeds the description in the value as "DESC\0VALUE".
      // Normalize it to the TXXX shape: key "format:TXX:DESC", value the text.
      if (TXXX_SHORT_IDS.has(tag.id.toUpperCase()) && tag.value.includes('\0')) {
        const nullIndex = tag.value.indexOf('\0')
        key = `${formatType}:${tag.id}:${tag.value.substring(0, nullIndex)}`
        let text = tag.value.substring(nullIndex + 1)
        if (text.charCodeAt(0) === 0xfeff) text = text.substring(1)
        value = text
      }

      customTags.push({ key, value })
    }
  }

  return customTags
}

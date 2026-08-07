import { TagKeyValue } from '../../shared/domain'
import { joinMultiValue } from '../../shared/multi-value'
import * as ape from '../formats/ape'
import * as apple from '../formats/apple'
import * as asf from '../formats/asf'
import { writeToAllNativeTags } from '../formats/fan-out'
import * as id3v2 from '../formats/id3v2'
import * as xiph from '../formats/xiph'
import { TagContext } from '../tag-context'

/** Write arbitrary key/value tags; a `null` value removes the tag everywhere. */
export function writeCustomTags(ctx: TagContext, customTags: TagKeyValue[]) {
  for (const [key, values] of groupByKey(customTags)) {
    if (values.length === 0) {
      writeToAllNativeTags(ctx, key, undefined)
    } else if (ctx.xiph && values.length > 1) {
      writeMultiValue(ctx, key, values)
    } else {
      writeToAllNativeTags(ctx, key, values[0])
    }
  }
}

/** Group by upper-cased key so multi-value tags survive as a single field. */
function groupByKey(customTags: TagKeyValue[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>()

  for (const { key, value } of customTags) {
    const upperKey = key.toUpperCase()
    const values = grouped.get(upperKey) ?? []
    if (value !== null) values.push(value)
    grouped.set(upperKey, values)
  }

  return grouped
}

/** Only Xiph stores several values per field; the rest get the joined string. */
function writeMultiValue(ctx: TagContext, key: string, values: string[]) {
  if (ctx.xiph) xiph.setFieldValues(ctx.xiph, key, values)

  const joined = joinMultiValue(values) ?? undefined
  if (ctx.id3v2) id3v2.setTxxx(ctx.id3v2, key, joined)
  if (ctx.apple) apple.setItunesField(ctx.apple, key, joined)
  if (ctx.asf) asf.setField(ctx.asf, key, joined)
  if (ctx.ape) ape.setItem(ctx.ape, key, joined)
}

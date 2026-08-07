import { TagContext } from '../tag-context'
import * as ape from './ape'
import * as apple from './apple'
import * as asf from './asf'
import * as id3v2 from './id3v2'
import * as xiph from './xiph'

/**
 * Write a field to every native tag except ID3v2, which needs a frame-specific
 * call decided by the caller (TXXX vs a standard frame).
 */
export function writeToNonId3v2(ctx: TagContext, key: string, value: string | undefined) {
  if (ctx.xiph) xiph.setField(ctx.xiph, key, value)
  if (ctx.apple) apple.setItunesField(ctx.apple, key, value)
  if (ctx.asf) asf.setField(ctx.asf, key, value)
  if (ctx.ape) ape.setItem(ctx.ape, key, value)
}

/** Write a field as a TXXX frame in ID3v2 plus its native equivalent everywhere else. */
export function writeToAllNativeTags(ctx: TagContext, key: string, value: string | undefined) {
  if (ctx.id3v2) id3v2.setTxxx(ctx.id3v2, key, value)
  writeToNonId3v2(ctx, key, value)
}

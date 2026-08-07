import { AudioMetadataPatch } from '../../tags/domain'
import * as apple from '../formats/apple'
import * as asf from '../formats/asf'
import { writeToAllNativeTags, writeToNonId3v2 } from '../formats/fan-out'
import * as id3v2 from '../formats/id3v2'
import * as xiph from '../formats/xiph'
import { TagContext } from '../tag-context'
import { asOptionalText, asText } from './normalize'

/** Fields with no taglib convenience property, written per format. */
export function writeNativeFields(ctx: TagContext, patch: AudioMetadataPatch) {
  // Lyricist: ID3v2 uses the standard TEXT frame, other formats a named field.
  if (patch.lyricist !== undefined) {
    const lyricist = asOptionalText(patch.lyricist)
    if (ctx.id3v2) id3v2.setLyricist(ctx.id3v2, lyricist)
    writeToNonId3v2(ctx, 'LYRICIST', lyricist)
  }

  // Style: written as a STYLE field across every native format — ID3v2
  // `TXXX:STYLE`, Xiph `STYLE`, iTunes/ASF/APE `STYLE` — so it stays independent
  // of Genre (`TCON`) when read back.
  if (patch.style !== undefined) writeToAllNativeTags(ctx, 'STYLE', asOptionalText(patch.style))

  if (patch.barcode !== undefined) writeToAllNativeTags(ctx, 'BARCODE', asOptionalText(patch.barcode))
  if (patch.catalogNumber !== undefined)
    writeToAllNativeTags(ctx, 'CATALOGNUMBER', asOptionalText(patch.catalogNumber))
  if (patch.work !== undefined) writeToAllNativeTags(ctx, 'WORK', asOptionalText(patch.work))

  // Publisher: convenience property plus native overrides — Xiph calls it LABEL,
  // and iTunes/ASF need their own descriptors.
  if (patch.publisher !== undefined) {
    const publisher = asOptionalText(patch.publisher)
    ctx.tag.publisher = asText(patch.publisher)
    if (ctx.xiph) xiph.setField(ctx.xiph, 'LABEL', publisher)
    if (ctx.apple) apple.setItunesField(ctx.apple, 'LABEL', publisher)
    if (ctx.asf) asf.setDescriptor(ctx.asf, 'WM/Publisher', publisher)
  }

  // Original release date: ID3v2 uses the TDOR frame, others a named field.
  if (patch.originalReleaseDate !== undefined) {
    const originalDate = asOptionalText(patch.originalReleaseDate)
    if (ctx.id3v2) id3v2.setOriginalDate(ctx.id3v2, originalDate)
    writeToNonId3v2(ctx, 'ORIGINALDATE', originalDate)
  }

  // Rating: ID3v2 uses the POPM frame on its own scale, others store 0-100.
  if (patch.rating !== undefined) {
    if (ctx.id3v2) id3v2.setRating(ctx.id3v2, patch.rating)
    writeToNonId3v2(ctx, 'RATING', asOptionalText(patch.rating?.toString()))
  }
}

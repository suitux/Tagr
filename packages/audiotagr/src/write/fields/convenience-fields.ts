import { splitMultiValue } from '../../shared/multi-value'
import { AudioMetadataPatch } from '../../tags/domain'
import * as xiph from '../formats/xiph'
import { TagContext } from '../tag-context'
import { asNumber, asText } from './normalize'

/**
 * Fields taglib exposes as properties on the aggregate tag: assigning once
 * writes them to every native tag the file carries.
 */
export function writeConvenienceFields(ctx: TagContext, patch: AudioMetadataPatch) {
  const { tag } = ctx

  if (patch.title !== undefined) tag.title = asText(patch.title)
  if (patch.artist !== undefined) tag.performers = splitMultiValue(patch.artist)
  if (patch.sortArtist !== undefined) tag.performersSort = splitMultiValue(patch.sortArtist)
  if (patch.album !== undefined) tag.album = asText(patch.album)
  if (patch.sortAlbum !== undefined) tag.albumSort = asText(patch.sortAlbum)
  if (patch.trackNumber !== undefined) tag.track = asNumber(patch.trackNumber)
  if (patch.trackTotal !== undefined) tag.trackCount = asNumber(patch.trackTotal)
  if (patch.discNumber !== undefined) tag.disc = asNumber(patch.discNumber)
  if (patch.discTotal !== undefined) tag.discCount = asNumber(patch.discTotal)
  if (patch.year !== undefined) tag.year = asNumber(patch.year)
  if (patch.genre !== undefined) tag.genres = splitMultiValue(patch.genre)
  if (patch.albumArtist !== undefined) tag.albumArtists = splitMultiValue(patch.albumArtist)
  if (patch.sortAlbumArtist !== undefined) tag.albumArtistsSort = splitMultiValue(patch.sortAlbumArtist)
  if (patch.composer !== undefined) tag.composers = splitMultiValue(patch.composer)
  if (patch.conductor !== undefined) tag.conductor = asText(patch.conductor)
  if (patch.comment !== undefined) tag.comment = asText(patch.comment)
  if (patch.grouping !== undefined) tag.grouping = asText(patch.grouping)
  if (patch.copyright !== undefined) tag.copyright = asText(patch.copyright)
  if (patch.lyrics !== undefined) tag.lyrics = asText(patch.lyrics)
  if (patch.compilation !== undefined) tag.isCompilation = patch.compilation

  if (patch.bpm !== undefined) {
    tag.beatsPerMinute = asNumber(patch.bpm)
    // Vorbis comments need the canonical BPM field, not taglib's default TEMPO.
    if (ctx.xiph) xiph.setBeatsPerMinute(ctx.xiph, patch.bpm)
  }
}

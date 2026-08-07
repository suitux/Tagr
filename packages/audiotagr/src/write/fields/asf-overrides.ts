import { AudioMetadataPatch } from '../../tags/domain'
import * as asf from '../formats/asf'
import { TagContext } from '../tag-context'
import { asText } from './normalize'

/**
 * Fields whose taglib convenience property writes a descriptor ASF parsers do
 * not read back. Runs after the convenience pass to overwrite those.
 */
export function writeAsfOverrides(ctx: TagContext, patch: AudioMetadataPatch) {
  if (!ctx.asf) return

  if (patch.comment !== undefined) {
    asf.setDescriptor(ctx.asf, 'Description', asText(patch.comment))
  }

  if (patch.trackTotal !== undefined) {
    // ASF encodes the total in the track descriptor itself ("3/12").
    const trackNo = patch.trackNumber ?? ctx.file.tag.track ?? 0
    if (trackNo > 0) {
      asf.setDescriptor(ctx.asf, 'WM/TrackNumber', `${trackNo}/${patch.trackTotal ?? 0}`)
    }
  }

  if (patch.compilation !== undefined) {
    asf.setDescriptor(ctx.asf, 'WM/IsCompilation', patch.compilation ? '1' : '0')
  }
}

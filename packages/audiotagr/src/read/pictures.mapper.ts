import type { IPicture } from 'music-metadata'
import { TagPicture } from '../shared/domain'

/**
 * Wrap each parsed picture in a Buffer view instead of copying it: copying
 * transiently doubles the off-heap footprint of every embedded image, which is a
 * key contributor to memory pressure when scanning large libraries.
 */
export function mapPictures(pictures: IPicture[] | undefined): TagPicture[] {
  return (pictures ?? []).map(picture => ({
    type: picture.type || null,
    format: picture.format,
    description: picture.description || null,
    data: Buffer.from(picture.data.buffer, picture.data.byteOffset, picture.data.byteLength)
  }))
}

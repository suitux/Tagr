import type { AudioFileMetadata } from 'audiotagr'
import type { SongCreateInput } from '@/features/metadata/domain'
import { parseDate } from '@/lib/date'

/**
 * Maps what was read from a file onto a song row: the package returns dates as
 * raw tag strings and knows nothing about the playback settings or the
 * bookkeeping columns Tagr keeps in the database.
 */
export function toSongCreateInput(metadata: AudioFileMetadata): SongCreateInput {
  const { customTags, pictures, originalReleaseDate, ...fields } = metadata

  return {
    ...fields,
    originalReleaseDate: parseDate(originalReleaseDate) ?? null,

    // Playback settings, not read from tags.
    volume: null,
    startTime: null,
    stopTime: null,

    dateAdded: new Date(),

    metadata: customTags.length > 0 ? customTags : undefined,
    pictures: pictures.length > 0 ? pictures : undefined
  }
}

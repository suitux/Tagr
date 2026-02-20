import { File } from 'node-taglib-sharp'
import { SongMetadataUpdate } from '@/features/metadata/domain'

export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const file = File.createFromPath(filePath)

  try {
    const tag = file.tag

    if (metadata.title !== undefined) {
      tag.title = metadata.title
    }

    if (metadata.artist !== undefined) {
      tag.performers = metadata.artist ? [metadata.artist] : []
    }

    if (metadata.album !== undefined) {
      tag.album = metadata.album
    }

    if (metadata.albumArtist !== undefined) {
      tag.albumArtists = metadata.albumArtist ? [metadata.albumArtist] : []
    }

    if (metadata.year !== undefined) {
      tag.year = metadata.year
    }

    if (metadata.trackNumber !== undefined) {
      tag.track = metadata.trackNumber
    }

    if (metadata.trackTotal !== undefined) {
      tag.trackCount = metadata.trackTotal
    }

    if (metadata.discNumber !== undefined) {
      tag.disc = metadata.discNumber
    }

    if (metadata.discTotal !== undefined) {
      tag.discCount = metadata.discTotal
    }

    if (metadata.genre !== undefined) {
      tag.genres = metadata.genre ? [metadata.genre] : []
    }

    if (metadata.composer !== undefined) {
      tag.composers = metadata.composer ? [metadata.composer] : []
    }

    if (metadata.comment !== undefined) {
      tag.comment = metadata.comment
    }

    if (metadata.lyrics !== undefined) {
      tag.lyrics = metadata.lyrics
    }

    if (metadata.bpm !== undefined) {
      tag.beatsPerMinute = metadata.bpm
    }

    file.save()
  } finally {
    file.dispose()
  }
}

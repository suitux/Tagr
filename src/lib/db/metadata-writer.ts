import { File } from 'node-taglib-sharp'

export interface SongMetadataUpdate {
  title?: string | null
  artist?: string | null
  album?: string | null
  albumArtist?: string | null
  year?: number | null
  trackNumber?: number | null
  trackTotal?: number | null
  discNumber?: number | null
  discTotal?: number | null
  genre?: string | null
  composer?: string | null
  comment?: string | null
  lyrics?: string | null
  [key: string]: string | number | null | undefined
}

export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const file = File.createFromPath(filePath)

  try {
    const tag = file.tag

    if (metadata.title !== undefined) {
      tag.title = metadata.title ?? undefined
    }

    if (metadata.artist !== undefined) {
      tag.performers = metadata.artist ? [metadata.artist] : []
    }

    if (metadata.album !== undefined) {
      tag.album = metadata.album ?? undefined
    }

    if (metadata.albumArtist !== undefined) {
      tag.albumArtists = metadata.albumArtist ? [metadata.albumArtist] : []
    }

    if (metadata.year !== undefined) {
      tag.year = metadata.year ?? 0
    }

    if (metadata.trackNumber !== undefined) {
      tag.track = metadata.trackNumber ?? 0
    }

    if (metadata.trackTotal !== undefined) {
      tag.trackCount = metadata.trackTotal ?? 0
    }

    if (metadata.discNumber !== undefined) {
      tag.disc = metadata.discNumber ?? 0
    }

    if (metadata.discTotal !== undefined) {
      tag.discCount = metadata.discTotal ?? 0
    }

    if (metadata.genre !== undefined) {
      tag.genres = metadata.genre ? [metadata.genre] : []
    }

    if (metadata.composer !== undefined) {
      tag.composers = metadata.composer ? [metadata.composer] : []
    }

    if (metadata.comment !== undefined) {
      tag.comment = metadata.comment ?? undefined
    }

    if (metadata.lyrics !== undefined) {
      tag.lyrics = metadata.lyrics ?? undefined
    }

    file.save()
  } finally {
    file.dispose()
  }
}

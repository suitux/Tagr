import { type AudioMetadataPatch, writeAudioMetadata, writeAudioPicture } from 'audiotagr'
import type { SongMetadataUpdate } from '@/features/metadata/domain'

/** Playback settings Tagr keeps in the database only — never written to the file. */
const DB_ONLY_FIELDS = ['volume', 'startTime', 'stopTime', 'gapless'] as const

/** Writes the editable tags back to the file. */
export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const { customMetadata, ...fields } = metadata

  const tags: AudioMetadataPatch = {
    ...fields,
    ...(customMetadata && { customTags: customMetadata })
  }
  for (const field of DB_ONLY_FIELDS) {
    delete (tags as Record<string, unknown>)[field]
  }

  await writeAudioMetadata(filePath, tags)
}

export async function writePictureToFile(filePath: string, imageBuffer: Buffer, mimeType: string): Promise<void> {
  await writeAudioPicture(filePath, imageBuffer, mimeType)
}

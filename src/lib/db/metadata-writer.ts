import { updateTags } from 'taglib-wasm'

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

// Mapping from our field names to taglib-wasm field names
const fieldMapping: Record<string, string> = {
  albumArtist: 'albumartist',
  trackNumber: 'track',
  discNumber: 'disc'
}

export async function writeMetadataToFile(filePath: string, metadata: SongMetadataUpdate): Promise<void> {
  const tags: Record<string, string | number | undefined> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue

    // Map field name if needed
    const taglibKey = fieldMapping[key] ?? key

    // Convert null to empty string/0, otherwise use the value
    if (typeof value === 'number' || value === null) {
      tags[taglibKey] = value ?? 0
    } else {
      tags[taglibKey] = value ?? ''
    }
  }

  // Write the tags to the file
  await updateTags(filePath, tags)
}

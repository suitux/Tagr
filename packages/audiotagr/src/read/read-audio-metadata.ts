import fs from 'fs/promises'
import * as musicMetadata from 'music-metadata'
import { MetadataReadError } from '../shared/errors'
import { AudioFileMetadata, NativeTagMap } from '../tags/domain'
import { mapAudioProperties } from './audio-properties.mapper'
import { mapAudioTags } from './common-fields.mapper'
import { mapFileInfo } from './file-info.mapper'
import { mapCustomTags } from './native-tags.mapper'
import { mapPictures } from './pictures.mapper'

/**
 * Read every tag, audio property and embedded picture from an audio file.
 *
 * @throws {MetadataReadError} when the file cannot be stat'ed or parsed.
 */
export async function readAudioMetadata(filePath: string): Promise<AudioFileMetadata> {
  try {
    const stats = await fs.stat(filePath)
    const { common, format, native } = await musicMetadata.parseFile(filePath, { duration: true })
    const nativeTags = native as NativeTagMap | undefined

    return {
      ...mapFileInfo(filePath, stats),
      ...mapAudioTags(common, nativeTags),
      ...mapAudioProperties(format, common),
      customTags: mapCustomTags(nativeTags),
      pictures: mapPictures(common.picture)
    }
  } catch (error) {
    throw new MetadataReadError(filePath, { cause: error })
  }
}

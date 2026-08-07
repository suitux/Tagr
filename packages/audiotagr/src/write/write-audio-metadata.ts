import { File } from 'node-taglib-sharp'
import { MetadataWriteError } from '../shared/errors'
import { AudioMetadataPatch } from '../tags/domain'
import { writeAsfOverrides } from './fields/asf-overrides'
import { writeConvenienceFields } from './fields/convenience-fields'
import { writeCustomTags } from './fields/custom-tags'
import { writeNativeFields } from './fields/native-fields'
import { getTagContext } from './tag-context'

/**
 * Write the given fields to every tag the file carries, leaving fields absent
 * from the patch untouched. Empty strings and `null` clear a tag.
 *
 * @throws {MetadataWriteError} when the file cannot be opened or saved.
 */
export async function writeAudioMetadata(filePath: string, patch: AudioMetadataPatch): Promise<void> {
  let file
  try {
    file = File.createFromPath(filePath)
  } catch (error) {
    throw new MetadataWriteError(filePath, { cause: error })
  }

  try {
    const ctx = getTagContext(file)

    writeConvenienceFields(ctx, patch)
    writeAsfOverrides(ctx, patch)
    writeNativeFields(ctx, patch)

    if (patch.customTags) {
      writeCustomTags(ctx, patch.customTags)
    }

    file.save()
  } catch (error) {
    throw new MetadataWriteError(filePath, { cause: error })
  } finally {
    file.dispose()
  }
}

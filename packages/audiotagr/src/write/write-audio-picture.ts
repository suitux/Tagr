import { ByteVector, File, Picture, PictureType } from 'node-taglib-sharp'
import { MetadataWriteError } from '../shared/errors'

/**
 * Replace every embedded picture with a single front cover.
 *
 * @throws {MetadataWriteError} when the file cannot be opened or saved.
 */
export async function writeAudioPicture(filePath: string, image: Buffer, mimeType: string): Promise<void> {
  let file
  try {
    file = File.createFromPath(filePath)
  } catch (error) {
    throw new MetadataWriteError(filePath, { cause: error })
  }

  try {
    const picture = Picture.fromData(ByteVector.fromByteArray(image))
    picture.mimeType = mimeType
    picture.type = PictureType.FrontCover
    file.tag.pictures = [picture]
    file.save()
  } catch (error) {
    throw new MetadataWriteError(filePath, { cause: error })
  } finally {
    file.dispose()
  }
}

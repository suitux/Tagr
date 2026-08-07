import type { ICommonTagsResult, IFormat } from 'music-metadata'
import { AudioProperties } from '../tags/domain'

export function mapAudioProperties(format: IFormat, common: ICommonTagsResult): AudioProperties {
  return {
    duration: format.duration || null,
    bitrate: format.bitrate ? Math.round(format.bitrate) : null,
    sampleRate: format.sampleRate || null,
    channels: format.numberOfChannels || null,
    bitsPerSample: format.bitsPerSample || null,
    codec: format.codec || null,
    lossless: format.lossless || false,
    encoder: common.encodedby || null
  }
}

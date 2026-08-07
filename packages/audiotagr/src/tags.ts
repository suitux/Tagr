/**
 * `audiotagr/tags` — the isomorphic subset: the tag model, the tag-name tables
 * and the value helpers. It touches neither the filesystem nor the tag parsers,
 * so UI code can share these types and helpers with the server.
 */

export { isMusicFile } from './files/music-file'

export { FIELD_MULTI_VALUE_SEPARATOR, MUSIC_EXTENSIONS } from './shared/constants'
export type { MusicExtension, TagKeyValue, TagPicture } from './shared/domain'
export { joinMultiValue, splitMultiValue, stripKeyPrefix } from './shared/multi-value'
export { AudioTagrError, MetadataReadError, MetadataWriteError } from './shared/errors'

export type {
  AudioFileInfo,
  AudioFileMetadata,
  AudioMetadataPatch,
  AudioProperties,
  AudioTags,
  NativeTag,
  NativeTagMap
} from './tags/domain'
export { MAPPED_NATIVE_TAGS, isMappedNativeTag } from './tags/native-tags'

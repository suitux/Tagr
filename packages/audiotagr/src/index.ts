// The isomorphic tag model and helpers, also published as `audiotagr/tags`.
export * from './tags'

// Reading
export { readAudioMetadata } from './read/read-audio-metadata'

// Writing
export { writeAudioMetadata } from './write/write-audio-metadata'
export { writeAudioPicture } from './write/write-audio-picture'

// Files
export { listAudioFiles, type ListAudioFilesOptions } from './files/list-audio-files'

// Scanning
export { scanFolder, scanFolders } from './scan/scan-folder'
export { DEFAULT_SCAN_BATCH_SIZE } from './scan/batch'
export type {
  ScanErrorItem,
  ScanItem,
  ScanOptions,
  ScanProgress,
  ScanSkippedItem,
  ScanSongItem
} from './scan/domain'

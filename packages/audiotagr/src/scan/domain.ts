import type { Stats } from 'fs'
import { AudioFileMetadata } from '../tags/domain'

export interface ScanProgress {
  /** 1-based index of the file just processed. */
  current: number
  total: number
  currentFile: string
}

/** A file was read successfully. */
export interface ScanSongItem {
  kind: 'song'
  filePath: string
  progress: ScanProgress
  metadata: AudioFileMetadata
}

/** A file was skipped because `shouldSkip` returned true. */
export interface ScanSkippedItem {
  kind: 'skipped'
  filePath: string
  progress: ScanProgress
}

/** A file could not be read; the scan continues with the next one. */
export interface ScanErrorItem {
  kind: 'error'
  filePath: string
  progress: ScanProgress
  error: string
}

export type ScanItem = ScanSongItem | ScanSkippedItem | ScanErrorItem

export interface ScanOptions {
  /**
   * Files processed between event-loop yields. Lower it on memory-constrained
   * hosts, raise it for throughput. Defaults to 100.
   */
  batchSize?: number
  /**
   * Decide whether a file can be skipped without reading its tags — e.g. when
   * its mtime matches what the consumer already stored.
   */
  shouldSkip?: (filePath: string, stats: Stats) => boolean | Promise<boolean>
  /** Called for each directory that cannot be read; traversal continues. */
  onDirectoryError?: (dirPath: string, error: string) => void
  /** Aborts the scan between files. */
  signal?: AbortSignal
}

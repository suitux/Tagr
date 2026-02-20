export interface SongMetadataUpdate {
  title?: string
  artist?: string
  album?: string
  albumArtist?: string
  year?: number
  trackNumber?: number
  trackTotal?: number
  discNumber?: number
  discTotal?: number
  genre?: string
  composer?: string
  comment?: string
  lyrics?: string
  bpm?: number
}

export interface ScanResult {
  totalScanned: number
  totalAdded: number
  totalUpdated: number
  totalDeleted: number
  totalErrors: number
  errors: Array<{ path: string; error: string }>
}

export interface ScanProgress {
  current: number
  total: number
  currentFile: string
}

export interface MetadataInput {
  key: string
  value: string | null
}

export interface PictureInput {
  type: string | null
  format: string | null
  description: string | null
  data: Buffer | null
}

export interface SongCreateInput {
  filePath: string
  fileName: string
  folderPath: string
  extension: string
  fileSize: number
  createdAt: Date | null
  modifiedAt: Date | null
  title: string | null
  artist: string | null
  album: string | null
  albumArtist: string | null
  year: number | null
  trackNumber: number | null
  trackTotal: number | null
  discNumber: number | null
  discTotal: number | null
  genre: string | null
  duration: number | null
  composer: string | null
  comment: string | null
  lyrics: string | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  bitsPerSample: number | null
  codec: string | null
  lossless: boolean
  bpm: number | null
  metadata?: MetadataInput[]
  pictures?: PictureInput[]
}

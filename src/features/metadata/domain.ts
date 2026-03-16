export interface SongMetadataUpdate {
  title?: string
  artist?: string
  sortArtist?: string
  album?: string
  sortAlbum?: string
  trackNumber?: number
  trackTotal?: number
  discNumber?: number
  discTotal?: number
  year?: number
  bpm?: number
  genre?: string
  albumArtist?: string
  sortAlbumArtist?: string
  composer?: string
  conductor?: string
  comment?: string
  grouping?: string
  publisher?: string
  catalogNumber?: string
  lyricist?: string
  barcode?: string
  work?: string
  originalReleaseDate?: string
  copyright?: string
  rating?: number
  lyrics?: string
  compilation?: boolean
  volume?: number
  startTime?: number
  stopTime?: number
  gapless?: boolean
  customMetadata?: { key: string; value: string | null }[]
}

export interface ScanResult {
  addedFiles: string[]
  updatedFiles: string[]
  deletedFiles: string[]
  skippedFiles: string[]
  errors: Array<{ path: string; error: string }>
}

export interface ScanResultResponse {
  added: { count: number; files: string[] }
  updated: { count: number; files: string[] }
  deleted: { count: number; files: string[] }
  skipped: { count: number }
  errors: Array<{ path: string; error: string }>
}

export const SCAN_FILE_LIST_LIMIT = 500

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
  sortArtist: string | null
  album: string | null
  sortAlbum: string | null
  trackNumber: number | null
  trackTotal: number | null
  discNumber: number | null
  discTotal: number | null
  year: number | null
  bpm: number | null
  genre: string | null
  albumArtist: string | null
  sortAlbumArtist: string | null
  composer: string | null
  conductor: string | null
  comment: string | null
  grouping: string | null
  publisher: string | null
  catalogNumber: string | null
  lyricist: string | null
  barcode: string | null
  work: string | null
  originalReleaseDate: Date | null
  copyright: string | null
  rating: number | null
  lyrics: string | null
  compilation: boolean
  volume: number | null
  startTime: number | null
  stopTime: number | null
  gapless: boolean

  dateAdded: Date | null

  duration: number | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  bitsPerSample: number | null
  codec: string | null
  lossless: boolean
  encoder: string | null

  metadata?: MetadataInput[]
  pictures?: PictureInput[]
}

// Native tag IDs already mapped to Song columns (case-insensitive)
export const MAPPED_NATIVE_TAGS = new Set(
  [
    // ID3v1
    'YEAR',
    // ID3v2.3/v2.4
    'TIT2',
    'TPE1',
    'TSOP',
    'TALB',
    'TSOA',
    'TRCK',
    'TPOS',
    'TYER',
    'TDRC',
    'TBPM',
    'TCON',
    'TPE2',
    'TSO2',
    'TCOM',
    'TPE3',
    'COMM',
    'TIT1',
    'GRP1',
    'TPUB',
    'TSST',
    'TEXT',
    'TDOR',
    'TORY',
    'TCOP',
    'POPM',
    'USLT',
    'SYLT',
    'TCMP',
    'TENC',
    'APIC',
    // ID3v2.2
    'TT2',
    'TP1',
    'TSP',
    'TAL',
    'TSA',
    'TRK',
    'TPA',
    'TYE',
    'TBP',
    'TCO',
    'TP2',
    'TS2',
    'TCM',
    'TP3',
    'COM',
    'TT1',
    'GP1',
    'TPB',
    'TXT',
    'TOR',
    'TCR',
    'TCP',
    'TEN',
    'PIC',
    // Vorbis/FLAC
    'TITLE',
    'ARTIST',
    'ARTISTSORT',
    'ALBUM',
    'ALBUMSORT',
    'TRACKNUMBER',
    'DISCNUMBER',
    'DATE',
    'BPM',
    'GENRE',
    'ALBUMARTIST',
    'ALBUM ARTIST',
    'PUBLISHER',
    'ALBUMARTISTSORT',
    'COMPOSER',
    'CONDUCTOR',
    'COMMENT',
    'GROUPING',
    'LABEL',
    'CATALOGNUMBER',
    'CATALOGID',
    'LYRICIST',
    'BARCODE',
    'WORK',
    'ORIGINALDATE',
    'ORIGINALYEAR',
    'COPYRIGHT',
    'RATING',
    'LYRICS',
    'COMPILATION',
    'ENCODEDBY',
    'METADATA_BLOCK_PICTURE',
    // iTunes/M4A
    '©NAM',
    '©ART',
    'SOAR',
    '©ALB',
    'SOAL',
    'TRKN',
    'DISK',
    'TMPO',
    '©GEN',
    'GNRE',
    'AART',
    'SOAA',
    '©WRT',
    '©CMT',
    '©COM',
    '©GRP',
    '©WRK',
    'CPRT',
    '©CPY',
    'RATE',
    '©LYR',
    'CPIL',
    'PGAP',
    '©TOO',
    'COVR',
    // APEv2
    'TRACK',
    'DISC',
    'ALBUM ARTIST',
    'CATALOGNUMBER',
    'ORIGINALDATE',
    'ORIGINALYEAR',
    'ENCODEDBY',
    'COVER ART (FRONT)',
    'COVER ART (BACK)',
    // Opus
    'TRACKTOTAL',
    'ORGANIZATION',
    'DISCTOTAL',
    // TXXX subtags
    'TXXX:BARCODE',
    'TXXX:CATALOGNUMBER',
    'TXXX:DISCOGS_CATALOG',
    'TXXX:CATALOGID',
    'TXXX:ORIGINALDATE',
    'TXXX:ORIGINALYEAR',
    'TXXX:WORK',
    'TXXX:RATING',
    // RIFF/INFO (WAV exif tags)
    'IART',
    'ICRD',
    'INAM',
    'TITL',
    'IPRD',
    'ITRK',
    'IPRT',
    'COMM',
    'ICMT',
    'ICNT',
    'GNRE',
    'IWRI',
    'RATE',
    'ISFT',
    'CODE',
    'TURL',
    'IGNR',
    'IENG',
    'ITCH',
    'IMED',
    'IRPD',
    'DIRC',
    'ICNM',
    'ICOP',
    'ISTR',
    'IFRM',
    // iTunes custom tags
    '----:COM.APPLE.ITUNES:CONDUCTOR',
    '----:COM.APPLE.ITUNES:NOTES',
    '----:COM.APPLE.ITUNES:LABEL',
    '----:COM.APPLE.ITUNES:CATALOGNUMBER',
    '----:COM.APPLE.ITUNES:LYRICIST',
    '----:COM.APPLE.ITUNES:BARCODE',
    '----:COM.APPLE.ITUNES:ORIGINALDATE',
    '----:COM.APPLE.ITUNES:ORIGINALYEAR',
    '----:COM.APPLE.ITUNES:ALBUMARTISTSORT',
    '----:COM.APPLE.ITUNES:BAND',
    '----:com.apple.iTunes:RATING',
    '----:com.apple.iTunes:WORK',
    '----:com.apple.iTunes:publisher',
    'cond',
    '©day',
    // ASF/WMA
    'AUTHOR',
    'DESCRIPTION',
    'TITLE',
    'COPYRIGHT',
    'WM/ALBUMARTIST',
    'WM/ALBUMARTISTSORTORDER',
    'WM/ALBUMSORTORDER',
    'WM/ALBUMTITLE',
    'WM/ARTISTSORTORDER',
    'WM/BARCODE',
    'WM/BEATSPERMINATE',
    'WM/CATALOGNO',
    'WM/COMPOSER',
    'WM/CONDUCTOR',
    'WM/CONTENTGROUPDESCRIPTION',
    'WM/ENCODEDBY',
    'WM/ENCODINGSETTINGS',
    'WM/GENRE',
    'WM/ISCOMPILATION',
    'WM/LYRICS',
    'WM/ORIGINALRELEASETIME',
    'WM/ORIGINALRELEASEYEAR',
    'WM/PARTOFSET',
    'WM/PUBLISHER',
    'WM/SHAREDUSERRATING',
    'WM/TEXT',
    'WM/TRACKNUMBER',
    'WM/WORK',
    'WM/WRITER',
    'WM/BEATSPERMINUTE',
    'WM/YEAR',
    'WM/PICTURE'
  ].map(t => t.toUpperCase())
)

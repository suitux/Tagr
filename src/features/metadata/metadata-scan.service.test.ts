import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockReaddir, mockStat, mockParseFile, repo } = vi.hoisted(() => ({
  mockReaddir: vi.fn(),
  mockStat: vi.fn(),
  mockParseFile: vi.fn(),
  repo: {
    createScannedSong: vi.fn(),
    replaceScannedSongByFilePath: vi.fn(),
    findSongByFilePath: vi.fn(),
    findSongById: vi.fn(),
    getSongIdsAndPathsInTree: vi.fn(),
    getSongModifiedTimesInTree: vi.fn(),
    deleteSongById: vi.fn(),
    replaceScannedSongById: vi.fn()
  }
}))

vi.mock('fs/promises', () => ({
  default: { readdir: mockReaddir, stat: mockStat }
}))

vi.mock('music-metadata', () => ({
  parseFile: (...args: unknown[]) => mockParseFile(...args)
}))

vi.mock('@/features/songs/songs.repository', () => repo)

import { scanAllFoldersAndUpdateDatabase } from './metadata-scan.service'

function dirent(name: string) {
  return { name, isDirectory: () => false, isFile: () => true }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockStat.mockResolvedValue({ size: 1, birthtime: new Date(0), mtime: new Date(0) })
  mockParseFile.mockResolvedValue({ common: {}, format: {}, native: {} })
  repo.findSongByFilePath.mockResolvedValue(null)
  repo.createScannedSong.mockResolvedValue(undefined)
  repo.getSongIdsAndPathsInTree.mockResolvedValue([])
})

afterEach(() => {
  delete (globalThis as { gc?: () => void }).gc
})

describe('scanAllFoldersAndUpdateDatabase batching', () => {
  it('scans every file across multiple batches and forces GC once per batch', async () => {
    const fileCount = 250 // 3 batches of 100, 100, 50
    mockReaddir.mockResolvedValue(Array.from({ length: fileCount }, (_, i) => dirent(`song${i}.mp3`)))

    const gc = vi.fn()
    ;(globalThis as { gc?: () => void }).gc = gc

    const result = await scanAllFoldersAndUpdateDatabase(['/music'], undefined, 'full')

    expect(repo.createScannedSong).toHaveBeenCalledTimes(fileCount)
    expect(result.addedFiles).toHaveLength(fileCount)
    // One GC pass per batch: ceil(250 / 100) = 3
    expect(gc).toHaveBeenCalledTimes(3)
  })

  it('is a no-op for GC when --expose-gc is not enabled', async () => {
    mockReaddir.mockResolvedValue([dirent('only.mp3')])

    // No globalThis.gc defined — must not throw.
    const result = await scanAllFoldersAndUpdateDatabase(['/music'], undefined, 'full')

    expect(result.addedFiles).toHaveLength(1)
  })
})

describe('genre / style separation (issue #26)', () => {
  type ScannedSong = {
    genre: string | null
    style: string | null
    metadata?: Array<{ key: string; value: string | null }>
  }

  async function scanSingle(parsed: {
    common?: Record<string, unknown>
    native?: Record<string, Array<{ id: string; value: unknown }>>
  }): Promise<ScannedSong> {
    mockReaddir.mockResolvedValue([dirent('song.mp3')])
    mockParseFile.mockResolvedValue({ common: {}, format: {}, native: {}, ...parsed })
    await scanAllFoldersAndUpdateDatabase(['/music'], undefined, 'full')
    return repo.createScannedSong.mock.calls[0][0] as ScannedSong
  }

  it('splits ID3v2.4 TXXX:STYLE out of Genre into Style', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(song.genre).toBe('Pop Punk')
    expect(song.style).toBe('acoustic')
  })

  it('splits Vorbis STYLE (FLAC/Ogg) out of Genre into Style', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        vorbis: [
          { id: 'GENRE', value: 'Pop Punk' },
          { id: 'STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(song.genre).toBe('Pop Punk')
    expect(song.style).toBe('acoustic')
  })

  it('splits iTunes/M4A STYLE out of Genre into Style', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'iTunes MP4': [
          { id: '©gen', value: 'Pop Punk' },
          { id: '----:com.apple.iTunes:STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(song.genre).toBe('Pop Punk')
    expect(song.style).toBe('acoustic')
  })

  it('splits ID3v2.2 TXX STYLE embedded as "STYLE\\0value"', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.2': [
          { id: 'TCO', value: 'Pop Punk' },
          { id: 'TXX', value: 'STYLE\0acoustic' }
        ]
      }
    })

    expect(song.genre).toBe('Pop Punk')
    expect(song.style).toBe('acoustic')
  })

  it('does not duplicate Style into generic custom metadata', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' }
        ]
      }
    })

    const styleRow = song.metadata?.find(m => m.key.toUpperCase().endsWith('STYLE'))
    expect(styleRow).toBeUndefined()
  })

  it('keeps genuine multi-value genres when no STYLE frame is present', async () => {
    const song = await scanSingle({
      common: { genre: ['Rock', 'Metal'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Rock' },
          { id: 'TCON', value: 'Metal' }
        ]
      }
    })

    expect(song.genre).toBe('Rock;Metal')
    expect(song.style).toBeNull()
  })

  it('supports multiple STYLE values', async () => {
    const song = await scanSingle({
      common: { genre: ['Pop Punk', 'acoustic', 'lo-fi'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' },
          { id: 'TXXX:STYLE', value: 'lo-fi' }
        ]
      }
    })

    expect(song.genre).toBe('Pop Punk')
    expect(song.style).toBe('acoustic;lo-fi')
  })
})

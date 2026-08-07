import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NativeTagMap } from '../../src/tags/domain'

const { mockStat, mockParseFile } = vi.hoisted(() => ({
  mockStat: vi.fn(),
  mockParseFile: vi.fn()
}))

vi.mock('fs/promises', () => ({
  default: { stat: mockStat }
}))

vi.mock('music-metadata', () => ({
  parseFile: (...args: unknown[]) => mockParseFile(...args)
}))

import { readAudioMetadata } from '../../src/read/read-audio-metadata'
import { MetadataReadError } from '../../src/shared/errors'

function read(parsed: { common?: Record<string, unknown>; native?: NativeTagMap; format?: Record<string, unknown> }) {
  mockParseFile.mockResolvedValue({ common: {}, format: {}, native: {}, ...parsed })
  return readAudioMetadata('/music/song.mp3')
}

beforeEach(() => {
  vi.clearAllMocks()
  mockStat.mockResolvedValue({ size: 1234, birthtime: new Date(0), mtime: new Date(1) })
})

describe('file info', () => {
  it('derives path fields and file stats', async () => {
    const meta = await read({})

    expect(meta.fileName).toBe('song.mp3')
    expect(meta.folderPath).toBe('/music')
    expect(meta.extension).toBe('mp3')
    expect(meta.fileSize).toBe(1234)
    expect(meta.modifiedAt).toEqual(new Date(1))
  })

  it('wraps parser failures in a MetadataReadError carrying the path', async () => {
    mockParseFile.mockRejectedValue(new Error('corrupt header'))

    await expect(readAudioMetadata('/music/broken.mp3')).rejects.toMatchObject({
      name: 'MetadataReadError',
      filePath: '/music/broken.mp3'
    })
    await expect(readAudioMetadata('/music/broken.mp3')).rejects.toBeInstanceOf(MetadataReadError)
  })
})

describe('genre / style separation', () => {
  it('splits ID3v2.4 TXXX:STYLE out of Genre into Style', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic')
  })

  it('splits Vorbis STYLE (FLAC/Ogg) out of Genre into Style', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        vorbis: [
          { id: 'GENRE', value: 'Pop Punk' },
          { id: 'STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic')
  })

  it('splits iTunes/M4A STYLE out of Genre into Style', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'iTunes MP4': [
          { id: '©gen', value: 'Pop Punk' },
          { id: '----:com.apple.iTunes:STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic')
  })

  it('splits ID3v2.2 TXX STYLE embedded as "STYLE\\0value"', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.2': [
          { id: 'TCO', value: 'Pop Punk' },
          { id: 'TXX', value: 'STYLE\0acoustic' }
        ]
      }
    })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic')
  })

  it('does not duplicate Style into custom tags', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' }
        ]
      }
    })

    expect(meta.customTags.find(t => t.key.toUpperCase().endsWith('STYLE'))).toBeUndefined()
  })

  it('keeps genuine multi-value genres when no STYLE frame is present', async () => {
    const meta = await read({
      common: { genre: ['Rock', 'Metal'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Rock' },
          { id: 'TCON', value: 'Metal' }
        ]
      }
    })

    expect(meta.genre).toBe('Rock;Metal')
    expect(meta.style).toBeNull()
  })

  it('supports multiple STYLE values', async () => {
    const meta = await read({
      common: { genre: ['Pop Punk', 'acoustic', 'lo-fi'] },
      native: {
        'ID3v2.4': [
          { id: 'TCON', value: 'Pop Punk' },
          { id: 'TXXX:STYLE', value: 'acoustic' },
          { id: 'TXXX:STYLE', value: 'lo-fi' }
        ]
      }
    })

    expect(meta.genre).toBe('Pop Punk')
    expect(meta.style).toBe('acoustic;lo-fi')
  })
})

describe('custom tags', () => {
  it('namespaces unmapped tags by format and skips mapped ones', async () => {
    const meta = await read({
      native: {
        'ID3v2.4': [
          { id: 'TIT2', value: 'Mapped title' },
          { id: 'TXXX:MOOD', value: 'calm' }
        ]
      }
    })

    expect(meta.customTags).toEqual([{ key: 'ID3v2.4:TXXX:MOOD', value: 'calm' }])
  })

  it('normalizes ID3v2.2 TXX frames to the TXXX key shape', async () => {
    const meta = await read({
      native: { 'ID3v2.2': [{ id: 'TXX', value: 'MOOD\0calm' }] }
    })

    expect(meta.customTags).toEqual([{ key: 'ID3v2.2:TXX:MOOD', value: 'calm' }])
  })
})

describe('field mapping', () => {
  it('flattens multi-value fields and normalizes rating to 0-100', async () => {
    const meta = await read({
      common: {
        artists: ['A', 'B'],
        rating: [{ rating: 0.8 }],
        originalyear: 1998
      }
    })

    expect(meta.artist).toBe('A;B')
    expect(meta.rating).toBe(80)
    expect(meta.originalReleaseDate).toBe('1998')
  })
})

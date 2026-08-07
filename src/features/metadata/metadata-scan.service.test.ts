import type { AudioFileMetadata, ScanItem } from 'audiotagr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockScanFolder, mockReadAudioMetadata, repo } = vi.hoisted(() => ({
  mockScanFolder: vi.fn(),
  mockReadAudioMetadata: vi.fn(),
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

vi.mock('audiotagr', () => ({
  scanFolder: (...args: unknown[]) => mockScanFolder(...args),
  readAudioMetadata: (...args: unknown[]) => mockReadAudioMetadata(...args)
}))

vi.mock('@/features/songs/songs.repository', () => repo)

import { scanFolderAndUpdateDatabase } from './metadata-scan.service'

function metadata(filePath: string): AudioFileMetadata {
  return {
    filePath,
    fileName: filePath.split('/').pop()!,
    folderPath: '/music',
    extension: 'mp3',
    fileSize: 1,
    createdAt: new Date(0),
    modifiedAt: new Date(0),
    title: 'Song',
    originalReleaseDate: '1998',
    customTags: [{ key: 'ID3v2.4:TXXX:MOOD', value: 'calm' }],
    pictures: []
  } as unknown as AudioFileMetadata
}

function song(filePath: string): ScanItem {
  return {
    kind: 'song',
    filePath,
    progress: { current: 1, total: 1, currentFile: filePath },
    metadata: metadata(filePath)
  }
}

function yields(...items: ScanItem[]) {
  mockScanFolder.mockImplementation(async function* () {
    for (const item of items) yield item
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  repo.findSongByFilePath.mockResolvedValue(null)
  repo.getSongIdsAndPathsInTree.mockResolvedValue([])
  repo.getSongModifiedTimesInTree.mockResolvedValue([])
})

describe('persistence', () => {
  it('creates a song for a file that is not in the database yet', async () => {
    yields(song('/music/a.mp3'))

    const result = await scanFolderAndUpdateDatabase('/music')

    expect(result.addedFiles).toEqual(['/music/a.mp3'])
    const [songFields, customTags] = repo.createScannedSong.mock.calls[0]
    expect(songFields.title).toBe('Song')
    // Raw tag dates become real dates, and playback settings default to null.
    expect(songFields.originalReleaseDate).toEqual(new Date(1998, 0, 1))
    expect(songFields.volume).toBeNull()
    expect(customTags).toEqual([{ key: 'ID3v2.4:TXXX:MOOD', value: 'calm' }])
  })

  it('replaces a song that already exists', async () => {
    repo.findSongByFilePath.mockResolvedValue({ id: 7 })
    yields(song('/music/a.mp3'))

    const result = await scanFolderAndUpdateDatabase('/music')

    expect(result.updatedFiles).toEqual(['/music/a.mp3'])
    expect(repo.replaceScannedSongByFilePath).toHaveBeenCalledWith(
      '/music/a.mp3',
      7,
      expect.objectContaining({ title: 'Song' }),
      expect.anything(),
      undefined
    )
  })

  it('records database failures as scan errors without aborting', async () => {
    repo.createScannedSong.mockRejectedValueOnce(new Error('disk full'))
    yields(song('/music/a.mp3'), song('/music/b.mp3'))

    const result = await scanFolderAndUpdateDatabase('/music')

    expect(result.errors).toEqual([{ path: '/music/a.mp3', error: 'disk full' }])
    expect(result.addedFiles).toEqual(['/music/b.mp3'])
  })

  it('forwards read errors and skips from the scanner', async () => {
    yields(
      { kind: 'error', filePath: '/music/bad.mp3', progress: { current: 1, total: 2, currentFile: '' }, error: 'boom' },
      { kind: 'skipped', filePath: '/music/old.mp3', progress: { current: 2, total: 2, currentFile: '' } }
    )

    const result = await scanFolderAndUpdateDatabase('/music')

    expect(result.errors).toEqual([{ path: '/music/bad.mp3', error: 'boom' }])
    expect(result.skippedFiles).toEqual(['/music/old.mp3'])
    expect(repo.createScannedSong).not.toHaveBeenCalled()
  })
})

describe('orphan deletion', () => {
  it('deletes songs whose files are gone but keeps skipped ones', async () => {
    yields(song('/music/a.mp3'), {
      kind: 'skipped',
      filePath: '/music/b.mp3',
      progress: { current: 2, total: 2, currentFile: '' }
    })
    repo.getSongIdsAndPathsInTree.mockResolvedValue([
      { id: 1, filePath: '/music/a.mp3' },
      { id: 2, filePath: '/music/b.mp3' },
      { id: 3, filePath: '/music/gone.mp3' }
    ])

    const result = await scanFolderAndUpdateDatabase('/music')

    expect(repo.deleteSongById).toHaveBeenCalledExactlyOnceWith(3)
    expect(result.deletedFiles).toEqual(['/music/gone.mp3'])
  })
})

describe('quick mode', () => {
  it('skips files whose modification time still matches the database', async () => {
    yields()
    repo.getSongModifiedTimesInTree.mockResolvedValue([{ filePath: '/music/a.mp3', modifiedAt: new Date(1000) }])

    await scanFolderAndUpdateDatabase('/music', undefined, 'quick')

    const { shouldSkip } = mockScanFolder.mock.calls[0][1]
    expect(shouldSkip('/music/a.mp3', { mtime: new Date(1000) })).toBe(true)
    expect(shouldSkip('/music/a.mp3', { mtime: new Date(2000) })).toBe(false)
    expect(shouldSkip('/music/unknown.mp3', { mtime: new Date(1000) })).toBe(false)
  })

  it('does not fetch modification times in full mode', async () => {
    yields()

    await scanFolderAndUpdateDatabase('/music', undefined, 'full')

    expect(repo.getSongModifiedTimesInTree).not.toHaveBeenCalled()
    expect(mockScanFolder.mock.calls[0][1].shouldSkip).toBeUndefined()
  })
})

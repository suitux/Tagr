import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockReaddir, mockStat, mockParseFile } = vi.hoisted(() => ({
  mockReaddir: vi.fn(),
  mockStat: vi.fn(),
  mockParseFile: vi.fn()
}))

vi.mock('fs/promises', () => ({
  default: { readdir: mockReaddir, stat: mockStat }
}))

vi.mock('music-metadata', () => ({
  parseFile: (...args: unknown[]) => mockParseFile(...args)
}))

import { ScanItem } from '../../src/scan/domain'
import { scanFolder, scanFolders } from '../../src/scan/scan-folder'

function dirent(name: string) {
  return { name, isDirectory: () => false, isFile: () => true }
}

async function collect(items: AsyncGenerator<ScanItem>): Promise<ScanItem[]> {
  const collected: ScanItem[] = []
  for await (const item of items) collected.push(item)
  return collected
}

beforeEach(() => {
  vi.clearAllMocks()
  mockStat.mockResolvedValue({ size: 1, birthtime: new Date(0), mtime: new Date(0) })
  mockParseFile.mockResolvedValue({ common: {}, format: {}, native: {} })
})

afterEach(() => {
  delete (globalThis as { gc?: () => void }).gc
})

describe('batching', () => {
  it('yields every file across batches and forces GC once per batch', async () => {
    const fileCount = 250 // 3 batches of 100, 100, 50
    mockReaddir.mockResolvedValue(Array.from({ length: fileCount }, (_, i) => dirent(`song${i}.mp3`)))

    const gc = vi.fn()
    ;(globalThis as { gc?: () => void }).gc = gc

    const items = await collect(scanFolder('/music'))

    expect(items).toHaveLength(fileCount)
    expect(items.every(i => i.kind === 'song')).toBe(true)
    expect(gc).toHaveBeenCalledTimes(3)
  })

  it('is a no-op for GC when --expose-gc is not enabled', async () => {
    mockReaddir.mockResolvedValue([dirent('only.mp3')])

    const items = await collect(scanFolder('/music'))

    expect(items).toHaveLength(1)
  })

  it('honours a custom batch size', async () => {
    mockReaddir.mockResolvedValue(Array.from({ length: 10 }, (_, i) => dirent(`song${i}.mp3`)))

    const gc = vi.fn()
    ;(globalThis as { gc?: () => void }).gc = gc

    await collect(scanFolder('/music', { batchSize: 5 }))

    expect(gc).toHaveBeenCalledTimes(2)
  })
})

describe('items', () => {
  it('reports progress with the total and the current file', async () => {
    mockReaddir.mockResolvedValue([dirent('a.mp3'), dirent('b.mp3')])

    const items = await collect(scanFolder('/music'))

    expect(items.map(i => i.progress)).toEqual([
      { current: 1, total: 2, currentFile: '/music/a.mp3' },
      { current: 2, total: 2, currentFile: '/music/b.mp3' }
    ])
  })

  it('yields an error item and keeps scanning when a file cannot be read', async () => {
    mockReaddir.mockResolvedValue([dirent('broken.mp3'), dirent('fine.mp3')])
    mockParseFile.mockRejectedValueOnce(new Error('corrupt header'))

    const items = await collect(scanFolder('/music'))

    expect(items[0]).toMatchObject({ kind: 'error', filePath: '/music/broken.mp3' })
    expect(items[1].kind).toBe('song')
  })

  it('skips files rejected by shouldSkip without parsing them', async () => {
    mockReaddir.mockResolvedValue([dirent('old.mp3'), dirent('new.mp3')])

    const items = await collect(
      scanFolder('/music', { shouldSkip: filePath => filePath.endsWith('old.mp3') })
    )

    expect(items[0]).toMatchObject({ kind: 'skipped', filePath: '/music/old.mp3' })
    expect(items[1].kind).toBe('song')
    expect(mockParseFile).toHaveBeenCalledTimes(1)
  })

  it('does not skip a file whose stats cannot be read', async () => {
    mockReaddir.mockResolvedValue([dirent('a.mp3')])
    mockStat.mockRejectedValueOnce(new Error('ENOENT'))

    const items = await collect(scanFolder('/music', { shouldSkip: () => true }))

    expect(items[0].kind).toBe('song')
  })

  it('ignores non-audio files', async () => {
    mockReaddir.mockResolvedValue([dirent('cover.jpg'), dirent('._resource.mp3'), dirent('song.mp3')])

    const items = await collect(scanFolder('/music'))

    expect(items.map(i => i.filePath)).toEqual(['/music/song.mp3'])
  })

  it('aborts between files when the signal fires', async () => {
    mockReaddir.mockResolvedValue([dirent('a.mp3'), dirent('b.mp3')])
    const controller = new AbortController()

    const items: ScanItem[] = []
    await expect(
      (async () => {
        for await (const item of scanFolder('/music', { signal: controller.signal })) {
          items.push(item)
          controller.abort()
        }
      })()
    ).rejects.toThrow()

    expect(items).toHaveLength(1)
  })
})

describe('scanFolders', () => {
  it('tags each item with the folder it came from', async () => {
    mockReaddir.mockResolvedValue([dirent('song.mp3')])

    const items = []
    for await (const item of scanFolders(['/music/a', '/music/b'])) items.push(item)

    expect(items.map(i => i.folder)).toEqual(['/music/a', '/music/b'])
  })
})

// @vitest-environment node
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Song } from '@/generated/prisma/client'
import {
  countSongsExpiredUnder,
  deleteSongPermanently,
  moveSongToTrash,
  purgeExpiredTrash,
  removeOrphanedTrashRows,
  restoreSongFromTrash,
  runTrashMaintenance,
  setTrashRetentionDays
} from './trash.service'

const { songs, appProperties } = vi.hoisted(() => ({
  songs: new Map<number, Record<string, unknown>>(),
  appProperties: new Map<string, string>()
}))

let musicRoot = ''

vi.mock('@/features/songs/song-file-helpers', async importOriginal => ({
  ...(await importOriginal<typeof import('@/features/songs/song-file-helpers')>()),
  getMusicFolders: () => [musicRoot]
}))

vi.mock('@/features/songs/songs.repository', () => ({
  findSongByIdIncludingTrashed: async (id: number) => songs.get(id) ?? null,
  deleteSongById: async (id: number) => void songs.delete(id)
}))

vi.mock('@/features/songs/song-query.repository', () => ({
  getTrashedSongIds: async () => [...songs.values()].filter(song => song.deletedAt).map(song => song.id)
}))

vi.mock('@/features/config/app-properties.repository', () => ({
  getAppProperty: async (key: string) => appProperties.get(key) ?? null,
  setAppProperty: async (key: string, value: string) => void appProperties.set(key, value)
}))

vi.mock('./trash.repository', () => ({
  markSongTrashed: async (id: number, location: object, originalFilePath: string) => {
    const song = { ...songs.get(id), ...location, originalFilePath, deletedAt: new Date() }
    songs.set(id, song)
    return song
  },
  markSongRestored: async (id: number, location: object) => {
    const song = { ...songs.get(id), ...location, originalFilePath: null, deletedAt: null }
    songs.set(id, song)
    return song
  },
  findTrashedSongIdsDeletedBefore: async (before: Date) =>
    [...songs.values()]
      .filter(song => song.deletedAt && (song.deletedAt as Date) < before)
      .map(song => song.id as number),
  countTrashedSongsDeletedBefore: async (before: Date) =>
    [...songs.values()].filter(song => song.deletedAt && (song.deletedAt as Date) < before).length,
  findTrashedSongFiles: async () =>
    [...songs.values()].filter(song => song.deletedAt).map(song => ({ id: song.id, filePath: song.filePath })),
  getTrashTotals: async () => ({ count: 0, totalSize: 0 }),
  deleteSongDeletionsBefore: async () => 0
}))

async function addSong(id: number, relativePath: string) {
  const filePath = path.join(musicRoot, relativePath)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `song ${id}`)
  songs.set(id, {
    id,
    filePath,
    folderPath: path.dirname(filePath),
    fileName: path.basename(filePath),
    deletedAt: null,
    originalFilePath: null
  })
  return filePath
}

const exists = (filePath: string) =>
  fs.access(filePath).then(
    () => true,
    () => false
  )

describe('trash.service', () => {
  beforeEach(async () => {
    musicRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tagr-trash-'))
    songs.clear()
    appProperties.clear()
  })

  afterEach(async () => {
    await fs.rm(musicRoot, { recursive: true, force: true })
  })

  it('moves a song under <root>/__tagr_trash__ keeping its relative path', async () => {
    const original = await addSong(1, 'Artist/Album/01.mp3')

    const song = await moveSongToTrash(1)

    const trashPath = path.join(musicRoot, '__tagr_trash__', 'Artist/Album/01.mp3')
    expect(song.filePath).toBe(trashPath)
    expect(song.originalFilePath).toBe(original)
    expect(song.deletedAt).toBeInstanceOf(Date)
    expect(await exists(original)).toBe(false)
    expect(await exists(trashPath)).toBe(true)
  })

  it('does not overwrite a previous copy of the same file in the trash', async () => {
    await addSong(1, 'a.mp3')
    await moveSongToTrash(1)
    await addSong(2, 'a.mp3')

    const second = await moveSongToTrash(2)

    expect(second.filePath).not.toBe(songs.get(1)!.filePath)
    expect(await fs.readFile(songs.get(1)!.filePath as string, 'utf8')).toBe('song 1')
    expect(await fs.readFile(second.filePath, 'utf8')).toBe('song 2')
  })

  it('restores a song to its original path and cleans the emptied trash folders', async () => {
    const original = await addSong(1, 'Artist/Album/01.mp3')
    await moveSongToTrash(1)

    const song = await restoreSongFromTrash(1)

    expect(song.filePath).toBe(original)
    expect(song.deletedAt).toBeNull()
    expect(await exists(original)).toBe(true)
    expect(await exists(path.join(musicRoot, '__tagr_trash__'))).toBe(false)
  })

  it('refuses to restore over a file that took the original place', async () => {
    const original = await addSong(1, 'a.mp3')
    await moveSongToTrash(1)
    await fs.writeFile(original, 'newcomer')

    await expect(restoreSongFromTrash(1)).rejects.toThrow('already exists')
    expect(await fs.readFile(original, 'utf8')).toBe('newcomer')
  })

  it('only deletes permanently songs that are in the trash', async () => {
    const original = await addSong(1, 'a.mp3')

    await expect(deleteSongPermanently(1)).rejects.toThrow('not in the trash')
    expect(await exists(original)).toBe(true)

    const trashed = await moveSongToTrash(1)
    await deleteSongPermanently(1)

    expect(songs.has(1)).toBe(false)
    expect(await exists(trashed.filePath)).toBe(false)
  })

  it('purges only the songs older than the retention period', async () => {
    await setTrashRetentionDays(5)
    await addSong(1, 'old.mp3')
    await addSong(2, 'recent.mp3')
    await moveSongToTrash(1)
    await moveSongToTrash(2)
    songs.set(1, { ...songs.get(1), deletedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) })

    expect(await purgeExpiredTrash()).toBe(1)
    expect(songs.has(1)).toBe(false)
    expect((songs.get(2) as Song | undefined)?.deletedAt).toBeInstanceOf(Date)
  })

  it('reports a restore conflict with a code the client can translate', async () => {
    const original = await addSong(1, 'a.mp3')
    await moveSongToTrash(1)
    await fs.writeFile(original, 'newcomer')

    await expect(restoreSongFromTrash(1)).rejects.toMatchObject({ code: 'conflict', fileName: 'a.mp3' })
    expect(await fs.readFile(original, 'utf8')).toBe('newcomer')
    expect((songs.get(1) as Song | undefined)?.deletedAt).toBeInstanceOf(Date)
  })

  it('reports a file that is gone from disk instead of trashing its row', async () => {
    const original = await addSong(1, 'a.mp3')
    await fs.rm(original)

    await expect(moveSongToTrash(1)).rejects.toMatchObject({ code: 'missingFile' })
    expect(songs.get(1)!.deletedAt).toBeNull()
  })

  it('counts what a shorter retention would purge right away', async () => {
    await addSong(1, 'old.mp3')
    await addSong(2, 'recent.mp3')
    await moveSongToTrash(1)
    await moveSongToTrash(2)
    songs.set(1, { ...songs.get(1), deletedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) })

    expect(await countSongsExpiredUnder(5)).toBe(1)
    expect(await countSongsExpiredUnder(10)).toBe(0)
  })

  it('drops the rows of trashed songs whose file was removed by hand', async () => {
    await addSong(1, 'gone.mp3')
    await addSong(2, 'kept.mp3')
    await addSong(3, 'library.mp3')
    await moveSongToTrash(1)
    await moveSongToTrash(2)
    await fs.rm(songs.get(1)!.filePath as string)

    expect(await removeOrphanedTrashRows()).toBe(1)
    expect(songs.has(1)).toBe(false)
    expect(songs.has(2)).toBe(true)
  })

  it('keeps every trashed row while the music folder is unavailable', async () => {
    await addSong(1, 'a.mp3')
    await moveSongToTrash(1)
    // What an unmounted volume looks like: the mount point is there, and empty.
    await fs.rm(musicRoot, { recursive: true, force: true })
    await fs.mkdir(musicRoot)

    expect(await removeOrphanedTrashRows()).toBe(0)
    expect(songs.has(1)).toBe(true)
  })

  it('purges expired songs and orphans in one maintenance run', async () => {
    await addSong(1, 'old.mp3')
    await addSong(2, 'gone.mp3')
    await addSong(3, 'kept.mp3')
    await moveSongToTrash(1)
    await moveSongToTrash(2)
    await moveSongToTrash(3)
    songs.set(1, { ...songs.get(1), deletedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) })
    await fs.rm(songs.get(2)!.filePath as string)

    await runTrashMaintenance()

    expect([...songs.keys()]).toEqual([3])
  })
})

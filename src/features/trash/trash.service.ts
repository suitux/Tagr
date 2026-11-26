import { constants } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { getAppProperty, setAppProperty } from '@/features/config/app-properties.repository'
import { getMusicFolders, TRASH_FOLDER_NAME } from '@/features/songs/song-file-helpers'
import { getTrashedSongIds } from '@/features/songs/song-query.repository'
import { deleteSongById, findSongByIdIncludingTrashed } from '@/features/songs/songs.repository'
import type { Song } from '@/generated/prisma/client'
import {
  DEFAULT_TRASH_RETENTION_DAYS,
  isTrashRetentionDays,
  TRASH_RETENTION_DAYS_KEY,
  TrashError,
  type TrashRetentionDays,
  type TrashSummary
} from './domain'
import {
  countTrashedSongsDeletedBefore,
  deleteSongDeletionsBefore,
  findTrashedSongFiles,
  findTrashedSongIdsDeletedBefore,
  getTrashTotals,
  markSongRestored,
  markSongTrashed
} from './trash.repository'

const DAY_MS = 24 * 60 * 60 * 1000

/** How long a `SongDeletion` row is kept; the usage report only ever looks at the last 7 days. */
const DELETION_LOG_RETENTION_DAYS = 30

export async function getTrashRetentionDays(): Promise<TrashRetentionDays> {
  const stored = Number(await getAppProperty(TRASH_RETENTION_DAYS_KEY))
  return isTrashRetentionDays(stored) ? stored : DEFAULT_TRASH_RETENTION_DAYS
}

export async function setTrashRetentionDays(days: TrashRetentionDays): Promise<void> {
  await setAppProperty(TRASH_RETENTION_DAYS_KEY, String(days))
}

function expiryCutoff(retentionDays: number): Date {
  return new Date(Date.now() - retentionDays * DAY_MS)
}

/** The `MUSIC_FOLDERS` root a file lives under (the deepest one, should roots be nested). */
function findMusicRoot(filePath: string): string | null {
  const roots = getMusicFolders()
    .map(root => path.resolve(root))
    .filter(root => filePath.startsWith(root + path.sep))
    .sort((a, b) => b.length - a.length)

  return roots[0] ?? null
}

function getTrashRoot(filePath: string): string {
  const root = findMusicRoot(filePath)
  if (!root) throw new TrashError('outsideLibrary', 'The file is outside the music folders', path.basename(filePath))
  return path.join(root, TRASH_FOLDER_NAME)
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/** The same file deleted twice must not overwrite the first copy, so the newcomer gets a timestamp. */
async function availablePath(filePath: string): Promise<string> {
  if (!(await pathExists(filePath))) return filePath

  const { dir, name, ext } = path.parse(filePath)
  return path.join(dir, `${name}.${Date.now()}${ext}`)
}

const READ_ONLY_CODES = new Set(['EROFS', 'EACCES', 'EPERM'])

/** Turns the filesystem errors a user can act on into a `TrashError`; anything else is rethrown as is. */
function toTrashError(error: unknown, filePath: string): unknown {
  const code = (error as NodeJS.ErrnoException)?.code
  const fileName = path.basename(filePath)

  if (code && READ_ONLY_CODES.has(code)) {
    return new TrashError(
      'readOnly',
      'The music folder is read-only or the server lacks permission to write to it',
      fileName
    )
  }
  if (code === 'ENOENT') return new TrashError('missingFile', 'The file is no longer on disk', fileName)

  return error
}

/** A rename within one root never crosses disks, but a root mounted from several volumes might. */
async function moveFile(from: string, to: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(to), { recursive: true })

    try {
      await fs.rename(from, to)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error
      await fs.copyFile(from, to, constants.COPYFILE_EXCL)
      await fs.unlink(from)
    }
  } catch (error) {
    throw toTrashError(error, from)
  }
}

/** Drops the folders a song left empty inside the trash, up to and including the trash root. */
async function removeEmptyTrashFolders(folderPath: string, trashRoot: string): Promise<void> {
  let current = folderPath

  while (current === trashRoot || current.startsWith(trashRoot + path.sep)) {
    try {
      await fs.rmdir(current)
    } catch {
      return
    }
    current = path.dirname(current)
  }
}

function toLocation(filePath: string) {
  return { filePath, folderPath: path.dirname(filePath), fileName: path.basename(filePath) }
}

async function findTrashedSong(songId: number): Promise<Song & { originalFilePath: string }> {
  const song = await findSongByIdIncludingTrashed(songId)
  if (!song) throw new TrashError('notFound', 'Song not found')
  if (!song.deletedAt || !song.originalFilePath) {
    throw new TrashError('notTrashed', 'The song is not in the trash', song.fileName)
  }

  return song as Song & { originalFilePath: string }
}

/** Moves the file to `<root>/__tagr_trash__/<path relative to root>` and flags the row as trashed. */
export async function moveSongToTrash(songId: number): Promise<Song> {
  const song = await findSongByIdIncludingTrashed(songId)
  if (!song) throw new TrashError('notFound', 'Song not found')
  if (song.deletedAt) throw new TrashError('alreadyTrashed', 'The song is already in the trash', song.fileName)

  const root = findMusicRoot(song.filePath)
  if (!root) throw new TrashError('outsideLibrary', 'The file is outside the music folders', song.fileName)

  const trashPath = await availablePath(path.join(root, TRASH_FOLDER_NAME, path.relative(root, song.filePath)))
  await moveFile(song.filePath, trashPath)

  try {
    return await markSongTrashed(songId, toLocation(trashPath), song.filePath)
  } catch (error) {
    await moveFile(trashPath, song.filePath).catch(() => undefined)
    throw error
  }
}

/** Moves the file back where it was deleted from; never overwrites a file that took its place. */
export async function restoreSongFromTrash(songId: number): Promise<Song> {
  const song = await findTrashedSong(songId)
  const trashRoot = getTrashRoot(song.filePath)

  if (await pathExists(song.originalFilePath)) {
    throw new TrashError('conflict', 'Another file already exists at the original location', song.fileName)
  }

  await moveFile(song.filePath, song.originalFilePath)

  try {
    const restored = await markSongRestored(songId, toLocation(song.originalFilePath))
    await removeEmptyTrashFolders(path.dirname(song.filePath), trashRoot)
    return restored
  } catch (error) {
    await moveFile(song.originalFilePath, song.filePath).catch(() => undefined)
    throw error
  }
}

/** Deletes a trashed song's file and row for good. Only songs already in the trash qualify. */
export async function deleteSongPermanently(songId: number): Promise<Song> {
  const song = await findTrashedSong(songId)
  const trashRoot = getTrashRoot(song.filePath)

  try {
    await fs.rm(song.filePath, { force: true })
  } catch (error) {
    throw toTrashError(error, song.filePath)
  }
  await deleteSongById(songId)
  await removeEmptyTrashFolders(path.dirname(song.filePath), trashRoot)

  return song
}

/** Deletes every song that has been in the trash longer than the retention period. */
export async function purgeExpiredTrash(): Promise<number> {
  const ids = await findTrashedSongIdsDeletedBefore(expiryCutoff(await getTrashRetentionDays()))

  let purged = 0
  for (const id of ids) {
    try {
      await deleteSongPermanently(id)
      purged++
    } catch (error) {
      console.error(`Failed to purge trashed song ${id}:`, error)
    }
  }

  return purged
}

/** How many trashed songs a given retention would purge right away; shown before lowering the setting. */
export function countSongsExpiredUnder(retentionDays: TrashRetentionDays): Promise<number> {
  return countTrashedSongsDeletedBefore(expiryCutoff(retentionDays))
}

/** An unmounted volume leaves an empty (or missing) mount point: every file in it looks deleted. */
async function isRootAvailable(root: string): Promise<boolean> {
  try {
    return (await fs.readdir(root)).length > 0
  } catch {
    return false
  }
}

/**
 * Drops the rows of trashed songs whose file somebody removed from `__tagr_trash__` by hand. Without
 * this they would sit in the trash view until the retention ran out, failing every restore.
 */
export async function removeOrphanedTrashRows(): Promise<number> {
  const rootAvailability = new Map<string, boolean>()
  let removed = 0

  for (const { id, filePath } of await findTrashedSongFiles()) {
    const root = findMusicRoot(filePath)
    if (!root) continue

    if (!rootAvailability.has(root)) rootAvailability.set(root, await isRootAvailable(root))
    if (!rootAvailability.get(root) || (await pathExists(filePath))) continue

    try {
      await deleteSongById(id)
      await removeEmptyTrashFolders(path.dirname(filePath), path.join(root, TRASH_FOLDER_NAME))
      removed++
    } catch (error) {
      console.error(`Failed to remove orphaned trash row ${id}:`, error)
    }
  }

  return removed
}

let maintenanceRun: Promise<void> | null = null

/**
 * Everything the trash needs done periodically: purge what expired, forget what was removed by hand
 * and trim the deletion log. Runs on a daily timer, after a delete and when the trash is opened;
 * overlapping calls share one run.
 */
export function runTrashMaintenance(): Promise<void> {
  maintenanceRun ??= (async () => {
    try {
      await purgeExpiredTrash()
      await removeOrphanedTrashRows()
      await deleteSongDeletionsBefore(expiryCutoff(DELETION_LOG_RETENTION_DAYS))
    } catch (error) {
      console.error('Trash maintenance failed:', error)
    } finally {
      maintenanceRun = null
    }
  })()

  return maintenanceRun
}

export function getTrashSummary(): Promise<TrashSummary> {
  return getTrashTotals()
}

export function getAllTrashedSongIds(): Promise<number[]> {
  return getTrashedSongIds()
}

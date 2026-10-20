import { constants } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { getAppProperty, setAppProperty } from '@/features/config/app-properties.repository'
import { getMusicFolders, TRASH_FOLDER_NAME } from '@/features/songs/song-file-helpers'
import { getTrashedSongIds } from '@/features/songs/song-query.repository'
import { deleteSongById, findSongById } from '@/features/songs/songs.repository'
import type { Song } from '@/generated/prisma/client'
import {
  DEFAULT_TRASH_RETENTION_DAYS,
  isTrashRetentionDays,
  TRASH_RETENTION_DAYS_KEY,
  type TrashRetentionDays
} from './domain'
import { findTrashedSongIdsDeletedBefore, markSongRestored, markSongTrashed } from './trash.repository'

const DAY_MS = 24 * 60 * 60 * 1000

export async function getTrashRetentionDays(): Promise<TrashRetentionDays> {
  const stored = Number(await getAppProperty(TRASH_RETENTION_DAYS_KEY))
  return isTrashRetentionDays(stored) ? stored : DEFAULT_TRASH_RETENTION_DAYS
}

export async function setTrashRetentionDays(days: TrashRetentionDays): Promise<void> {
  await setAppProperty(TRASH_RETENTION_DAYS_KEY, String(days))
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
  if (!root) throw new Error('The file is outside the music folders')
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

/** A rename within one root never crosses disks, but a root mounted from several volumes might. */
async function moveFile(from: string, to: string): Promise<void> {
  await fs.mkdir(path.dirname(to), { recursive: true })

  try {
    await fs.rename(from, to)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error
    await fs.copyFile(from, to, constants.COPYFILE_EXCL)
    await fs.unlink(from)
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
  const song = await findSongById(songId)
  if (!song) throw new Error('Song not found')
  if (!song.deletedAt || !song.originalFilePath) throw new Error('The song is not in the trash')

  return song as Song & { originalFilePath: string }
}

/** Moves the file to `<root>/__tagr_trash__/<path relative to root>` and flags the row as trashed. */
export async function moveSongToTrash(songId: number): Promise<Song> {
  const song = await findSongById(songId)
  if (!song) throw new Error('Song not found')
  if (song.deletedAt) throw new Error('The song is already in the trash')

  const root = findMusicRoot(song.filePath)
  if (!root) throw new Error('The file is outside the music folders')

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
    throw new Error('A file already exists at the original location')
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

  await fs.rm(song.filePath, { force: true })
  await deleteSongById(songId)
  await removeEmptyTrashFolders(path.dirname(song.filePath), trashRoot)

  return song
}

/** Deletes every song that has been in the trash longer than the retention period. */
export async function purgeExpiredTrash(): Promise<number> {
  const retentionDays = await getTrashRetentionDays()
  const ids = await findTrashedSongIdsDeletedBefore(new Date(Date.now() - retentionDays * DAY_MS))

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

export function getAllTrashedSongIds(): Promise<number[]> {
  return getTrashedSongIds()
}

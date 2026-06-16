import type { MetadataInput, PictureInput, SongCreateInput } from '@/features/metadata/domain'
import type { Song, SongPicture } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'

/** Song scalar fields without the nested relation inputs. */
export type SongScalarFields = Omit<SongCreateInput, 'metadata' | 'pictures'>

/** Matches a folder and all of its descendant folders. */
function folderTreeWhere(folderPath: string) {
  return {
    OR: [{ folderPath }, { folderPath: { startsWith: folderPath + '/' } }]
  }
}

function nestedRelations(metadata?: MetadataInput[], pictures?: PictureInput[]) {
  return {
    ...(metadata && { metadata: { create: metadata } }),
    ...(pictures && { pictures: { create: pictures } })
  }
}

export function countSongs(): Promise<number> {
  return prisma.song.count()
}

export function findSongById(id: number): Promise<Song | null> {
  return prisma.song.findUnique({ where: { id } })
}

export function findSongByFilePath(filePath: string): Promise<Song | null> {
  return prisma.song.findUnique({ where: { filePath } })
}

export function findSongWithMetadata(id: number) {
  return prisma.song.findUnique({ where: { id }, include: { metadata: true } })
}

export function findFirstSongPicture(songId: number): Promise<SongPicture | null> {
  return prisma.songPicture.findFirst({ where: { songId } })
}

export function findSongFilePath(id: number): Promise<{ filePath: string } | null> {
  return prisma.song.findUnique({ where: { id }, select: { filePath: true } })
}

export function findSongForPeaks(
  id: number
): Promise<{ filePath: string; duration: number | null; peaks: string | null } | null> {
  return prisma.song.findUnique({
    where: { id },
    select: { filePath: true, duration: true, peaks: true }
  })
}

export async function updateSongPeaks(id: number, peaksJson: string): Promise<void> {
  await prisma.song.update({ where: { id }, data: { peaks: peaksJson } })
}

/** Modified times for every song under a folder tree (quick-scan change detection). */
export function getSongModifiedTimesInTree(folderPath: string): Promise<{ filePath: string; modifiedAt: Date | null }[]> {
  return prisma.song.findMany({
    where: folderTreeWhere(folderPath),
    select: { filePath: true, modifiedAt: true }
  })
}

/** Ids + paths for every song under a folder tree (orphan deletion). */
export function getSongIdsAndPathsInTree(folderPath: string): Promise<{ id: number; filePath: string }[]> {
  return prisma.song.findMany({
    where: folderTreeWhere(folderPath),
    select: { id: true, filePath: true }
  })
}

export async function createScannedSong(
  songFields: SongScalarFields,
  metadata?: MetadataInput[],
  pictures?: PictureInput[]
): Promise<void> {
  await prisma.song.create({
    data: { ...songFields, ...nestedRelations(metadata, pictures) }
  })
}

/** Replaces a song's scalar fields, metadata and pictures, matched by file path. */
export async function replaceScannedSongByFilePath(
  filePath: string,
  songId: number,
  songFields: SongScalarFields,
  metadata?: MetadataInput[],
  pictures?: PictureInput[]
): Promise<void> {
  await prisma.songMetadata.deleteMany({ where: { songId } })
  await prisma.songPicture.deleteMany({ where: { songId } })
  await prisma.song.update({
    where: { filePath },
    data: { ...songFields, scannedAt: new Date(), ...nestedRelations(metadata, pictures) }
  })
}

/** Replaces a song's scalar fields, metadata and pictures, matched by id; returns with relations. */
export async function replaceScannedSongById(
  songId: number,
  songFields: SongScalarFields,
  metadata?: MetadataInput[],
  pictures?: PictureInput[]
) {
  await prisma.songMetadata.deleteMany({ where: { songId } })
  await prisma.songPicture.deleteMany({ where: { songId } })
  return prisma.song.update({
    where: { id: songId },
    data: { ...songFields, scannedAt: new Date(), ...nestedRelations(metadata, pictures) },
    include: { metadata: true, pictures: true }
  })
}

export function deleteSongById(id: number): Promise<void> {
  return prisma.song.delete({ where: { id } }).then(() => undefined)
}

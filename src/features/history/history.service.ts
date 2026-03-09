import { HISTORY_TRACKABLE_FIELDS, PICTURE_FIELD } from '@/features/history/consts'
import { BOOLEAN_SONG_FIELDS, NUMERIC_SONG_FIELDS } from '@/features/songs/domain'
import { Song } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { formatDate, ISO_DATE_FORMAT } from '@/lib/date'

function serialize(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return formatDate(value, ISO_DATE_FORMAT)
  return String(value)
}

export function deserialize(field: string, value: string | null): unknown {
  if (value === null || value === undefined) return null
  if (NUMERIC_SONG_FIELDS.has(field as never)) return Number(value)
  if (BOOLEAN_SONG_FIELDS.has(field as never)) return value === 'true'
  return value
}

export async function recordChanges(song: Song, update: Record<string, unknown>) {
  const entries: { songId: number; field: string; oldValue: string | null; newValue: string | null }[] = []

  for (const [field, newVal] of Object.entries(update)) {
    if (!HISTORY_TRACKABLE_FIELDS.has(field)) continue

    const oldVal = (song as Record<string, unknown>)[field]
    const oldSerialized = serialize(oldVal)
    const newSerialized = serialize(newVal)

    if (oldSerialized !== newSerialized) {
      entries.push({
        songId: song.id,
        field,
        oldValue: oldSerialized,
        newValue: newSerialized
      })
    }
  }

  if (entries.length > 0) {
    await prisma.songChangeHistory.createMany({ data: entries })
  }
}

function serializePicture(data: Buffer | null, format: string | null): string | null {
  if (!data) return null
  const mimeType = format || 'image/jpeg'
  return `data:${mimeType};base64,${data.toString('base64')}`
}

export function deserializePicture(value: string | null): { buffer: Buffer; mimeType: string } | null {
  if (!value) return null
  const match = value.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] }
}

export async function recordPictureChange(songId: number, newPictureData: string | null) {
  const oldPicture = await prisma.songPicture.findFirst({
    where: { songId },
    select: { data: true, format: true }
  })

  const oldValue = serializePicture(oldPicture?.data ? Buffer.from(oldPicture.data) : null, oldPicture?.format ?? null)

  if (oldValue === newPictureData) return

  await prisma.songChangeHistory.create({
    data: {
      songId,
      field: PICTURE_FIELD,
      oldValue,
      newValue: newPictureData
    }
  })
}

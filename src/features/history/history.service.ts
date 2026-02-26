import { HISTORY_TRACKABLE_FIELDS } from '@/features/history/consts'
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

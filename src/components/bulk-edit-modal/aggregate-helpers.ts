import { type Song } from '@/features/songs/domain'
import { type BulkEditableField, type BulkFieldType } from '@/features/songs/song-fields'
import { formatDate } from '@/lib/date'

export const MIXED = Symbol('mixed')
export type AggregateValue = string | number | boolean | null | typeof MIXED

function normalizeSongValue(song: Song, key: BulkEditableField, type: BulkFieldType): string | number | boolean | null {
  const raw = (song as unknown as Record<string, unknown>)[key]
  if (raw === undefined || raw === null) return null
  if (type === 'date') {
    if (raw instanceof Date) {
      return formatDate(raw, 'yyyy-MM-dd')
    }
    if (typeof raw === 'string') return raw
    return null
  }
  if (type === 'number' || type === 'rating') {
    return typeof raw === 'number' ? raw : Number(raw)
  }
  if (type === 'boolean') {
    return Boolean(raw)
  }
  return typeof raw === 'string' ? raw : String(raw)
}

export function computeAggregate(
  songs: Song[],
  key: BulkEditableField,
  type: BulkFieldType,
  forceMixed: boolean
): AggregateValue {
  if (songs.length === 0) return null
  if (forceMixed) return MIXED
  const first = normalizeSongValue(songs[0], key, type)
  for (let i = 1; i < songs.length; i++) {
    const v = normalizeSongValue(songs[i], key, type)
    if (v !== first) return MIXED
  }
  return first
}

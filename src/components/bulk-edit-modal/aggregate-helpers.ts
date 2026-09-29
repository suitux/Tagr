import { type Song, type SongWithMetadata } from '@/features/songs/domain'
import { joinMultiValue, stripKeyPrefix } from '@/features/songs/metadata-helpers'
import { type BulkEditableField, type BulkFieldType } from '@/features/songs/song-fields'
import type { SongMetadata } from '@/generated/prisma/client'
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

function readCustomValue(metadata: SongMetadata[], tagKey: string): string | null {
  const values = metadata.filter(row => stripKeyPrefix(row.key) === tagKey).map(row => row.value)
  if (values.length === 0) return null
  return joinMultiValue(values)
}

/**
 * Same contract as {@link computeAggregate} for an extended tag. The song list only carries
 * `metadata` when a custom column is visible, so a song without it counts as unknown — the row then
 * reads as mixed and stays untouched unless the user types into it.
 */
export function computeCustomAggregate(songs: Song[], tagKey: string, forceMixed: boolean): AggregateValue {
  if (songs.length === 0) return null
  if (forceMixed) return MIXED

  let first: string | null | undefined
  for (const song of songs) {
    const metadata = (song as Partial<SongWithMetadata>).metadata
    if (!metadata) return MIXED

    const value = readCustomValue(metadata, tagKey)
    if (first === undefined) first = value
    else if (value !== first) return MIXED
  }

  return first ?? null
}

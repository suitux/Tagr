import type { Song } from '@/features/songs/domain'
import { MUSIC_BRAINZ_FIELDS, type MusicBrainzMappedMetadata, type MusicBrainzReleaseTrack } from './domain'

type MatchFields =
  | 'id'
  | 'fileName'
  | 'folderPath'
  | 'duration'
  | 'title'
  | 'artist'
  | 'album'
  | 'albumArtist'
  | 'year'
  | 'trackNumber'
  | 'trackTotal'
  | 'discNumber'
  | 'discTotal'
  | 'publisher'
  | 'catalogNumber'
  | 'releaseType'
  | 'barcode'
  | 'genre'

/** A selected song as the bulk lookup sees it. Dates arrive as strings once they went through JSON. */
export type BulkMusicBrainzSong = Pick<Song, MatchFields> & { originalReleaseDate: Date | string | null }

export type MatchReason = 'number' | 'title' | 'duration'

export interface TrackMatch {
  trackId: string
  reason: MatchReason
}

export interface BulkMusicBrainzApplyItem {
  songId: number
  metadata: Partial<MusicBrainzMappedMetadata>
}

/** A duration-only match has to be this close, in seconds. */
const DURATION_TOLERANCE = 3
/** A disc/track number is not trusted when the title differs and the length is off by more than this. */
const NUMBER_MISMATCH_LENGTH = 10

/** Album order: folder, disc, track, file name - the order the match table lists the songs in. */
export function sortForMatching<T extends Pick<Song, 'folderPath' | 'discNumber' | 'trackNumber' | 'fileName'>>(
  songs: T[]
): T[] {
  return [...songs].sort(
    (a, b) =>
      a.folderPath.localeCompare(b.folderPath) ||
      (a.discNumber ?? 0) - (b.discNumber ?? 0) ||
      (a.trackNumber ?? 0) - (b.trackNumber ?? 0) ||
      a.fileName.localeCompare(b.fileName)
  )
}

/**
 * Lowercased, without accents, bracketed additions ("(Remastered 2011)", "[Live]") and punctuation,
 * so tags and MusicBrainz titles that only differ in those details still match.
 */
export function normalizeTitle(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[([][^)\]]*[)\]]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function lengthDifference(song: BulkMusicBrainzSong, track: MusicBrainzReleaseTrack): number | null {
  if (song.duration == null || track.length == null) return null
  return Math.abs(song.duration - track.length / 1000)
}

/**
 * Assigns each song at most one track of the release, the way Picard does it for a known album:
 * first by disc and track number, then by title, then by length. A track is used only once.
 * Songs without a match are left out of the result.
 */
export function matchSongsToTracks(
  songs: BulkMusicBrainzSong[],
  tracks: MusicBrainzReleaseTrack[]
): Map<number, TrackMatch> {
  const matches = new Map<number, TrackMatch>()
  const taken = new Set<string>()
  const discs = new Set(tracks.map(track => track.disc))
  const onlyDisc = discs.size === 1 ? [...discs][0] : null

  const assign = (song: BulkMusicBrainzSong, track: MusicBrainzReleaseTrack, reason: MatchReason) => {
    matches.set(song.id, { trackId: track.id, reason })
    taken.add(track.id)
  }
  const free = () => tracks.filter(track => !taken.has(track.id))

  for (const song of songs) {
    if (!song.trackNumber) continue
    const disc = song.discNumber ?? onlyDisc
    if (disc == null) continue

    const track = free().find(t => t.disc === disc && t.position === song.trackNumber)
    if (!track) continue

    const titleDiffers = !!song.title && normalizeTitle(song.title) !== normalizeTitle(track.title)
    const difference = lengthDifference(song, track)
    // Numbers from another edition point at the wrong track; then title and length both disagree.
    if (titleDiffers && difference !== null && difference > NUMBER_MISMATCH_LENGTH) continue

    assign(song, track, 'number')
  }

  for (const song of songs) {
    if (matches.has(song.id) || !song.title) continue
    const title = normalizeTitle(song.title)
    if (!title) continue

    const candidates = free().filter(track => normalizeTitle(track.title) === title)
    if (!candidates.length) continue

    const closest = [...candidates].sort(
      (a, b) => (lengthDifference(song, a) ?? Infinity) - (lengthDifference(song, b) ?? Infinity)
    )[0]
    assign(song, closest, 'title')
  }

  for (const song of songs) {
    if (matches.has(song.id) || song.duration == null) continue

    const candidates = free()
      .map(track => ({ track, difference: lengthDifference(song, track) }))
      .filter((c): c is { track: MusicBrainzReleaseTrack; difference: number } => c.difference !== null)
      .filter(c => c.difference <= DURATION_TOLERANCE)
      .sort((a, b) => a.difference - b.difference)

    // Two tracks equally close would be a guess.
    if (!candidates.length || (candidates[1] && candidates[1].difference - candidates[0].difference < 0.5)) continue

    assign(song, candidates[0].track, 'duration')
  }

  return matches
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** The stored date as YYYY-MM-DD in local time, which is how the scanner parsed it. */
function localDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Whether writing `next` would leave the field as it is. A partial date only compares its known part. */
export function isSameValue(field: keyof MusicBrainzMappedMetadata, current: unknown, next: unknown): boolean {
  if (next === undefined || next === null || next === '') return true
  if (current === undefined || current === null || current === '') return false

  if (field === 'originalReleaseDate') {
    const known = String(next)
    return localDate(current as Date | string).startsWith(known)
  }
  if (typeof next === 'number') return Number(current) === next

  return String(current).trim() === String(next).trim()
}

interface BuildApplyItemsParams {
  songs: BulkMusicBrainzSong[]
  /** songId -> trackId; songs that are left out or unmatched are simply not in the map. */
  assignment: Map<number, string>
  tracks: MusicBrainzReleaseTrack[]
  fields: Set<keyof MusicBrainzMappedMetadata>
  /** With a cover to write, a song is included even when none of its tags change. */
  withCover: boolean
}

/** One write per matched song with just the chosen fields whose value actually changes. */
export function buildApplyItems({
  songs,
  assignment,
  tracks,
  fields,
  withCover
}: BuildApplyItemsParams): BulkMusicBrainzApplyItem[] {
  const tracksById = new Map(tracks.map(track => [track.id, track]))
  const items: BulkMusicBrainzApplyItem[] = []

  for (const song of songs) {
    const trackId = assignment.get(song.id)
    const track = trackId ? tracksById.get(trackId) : undefined
    if (!track) continue

    const metadata: Partial<MusicBrainzMappedMetadata> = {}
    for (const field of MUSIC_BRAINZ_FIELDS) {
      if (!fields.has(field)) continue
      const next = track.mapped[field]
      if (next === undefined || isSameValue(field, song[field as keyof BulkMusicBrainzSong], next)) continue
      ;(metadata as Record<string, unknown>)[field] = next
    }

    if (Object.keys(metadata).length > 0 || withCover) items.push({ songId: song.id, metadata })
  }

  return items
}

/** Server-side check of an apply request: known fields only, plain values. */
export function isValidApplyItems(items: unknown): items is BulkMusicBrainzApplyItem[] {
  if (!Array.isArray(items) || items.length === 0) return false
  const allowed = new Set<string>(MUSIC_BRAINZ_FIELDS)

  return items.every(item => {
    if (!item || typeof item !== 'object') return false
    const { songId, metadata } = item as Record<string, unknown>
    if (typeof songId !== 'number' || !Number.isInteger(songId)) return false
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false
    return Object.entries(metadata).every(
      ([key, value]) => allowed.has(key) && (typeof value === 'string' || typeof value === 'number')
    )
  })
}

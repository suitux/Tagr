import type { BulkMusicBrainzSong } from '@/features/musicbrainz/bulk-lookup'
import type { MusicBrainzArtistCredit, MusicBrainzReleaseSearchResult } from '@/features/musicbrainz/domain'

export function formatArtistCredit(credits?: MusicBrainzArtistCredit[]): string {
  if (!credits?.length) return ''
  return credits.map(c => c.name + (c.joinphrase ?? '')).join('')
}

/** The value most songs share, ignoring empty ones - the album the selection most likely is. */
export function mostCommon(values: Array<string | null | undefined>): string {
  const counts = new Map<string, number>()
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

export function initialReleaseSearch(songs: BulkMusicBrainzSong[]) {
  return {
    album: mostCommon(songs.map(song => song.album)),
    artist: mostCommon(songs.map(song => song.albumArtist || song.artist))
  }
}

/** "2×CD", "CD + DVD" - how MusicBrainz itself summarises the media of a release. */
export function formatMedia(media?: MusicBrainzReleaseSearchResult['media']): string {
  if (!media?.length) return ''
  const counts = new Map<string, number>()
  for (const medium of media) {
    const format = medium.format ?? '?'
    counts.set(format, (counts.get(format) ?? 0) + 1)
  }
  return [...counts.entries()].map(([format, count]) => (count > 1 ? `${count}×${format}` : format)).join(' + ')
}

export function formatPosition(disc: number | null | undefined, position: number | null | undefined): string {
  if (!position) return ''
  const track = String(position).padStart(2, '0')
  return disc ? `${disc}-${track}` : track
}

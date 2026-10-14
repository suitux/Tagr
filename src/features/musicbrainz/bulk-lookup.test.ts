import { describe, expect, it } from 'vitest'
import {
  buildApplyItems,
  isSameValue,
  isValidApplyItems,
  matchSongsToTracks,
  normalizeTitle,
  sortForMatching,
  type BulkMusicBrainzSong
} from './bulk-lookup'
import type { MusicBrainzReleaseTrack } from './domain'

function song(id: number, fields: Partial<BulkMusicBrainzSong> = {}): BulkMusicBrainzSong {
  return {
    id,
    fileName: `${id}.mp3`,
    folderPath: '/music/album',
    duration: null,
    title: null,
    artist: null,
    album: null,
    albumArtist: null,
    year: null,
    trackNumber: null,
    trackTotal: null,
    discNumber: null,
    discTotal: null,
    publisher: null,
    catalogNumber: null,
    releaseType: null,
    barcode: null,
    genre: null,
    originalReleaseDate: null,
    ...fields
  }
}

function track(disc: number, position: number, title: string, seconds: number | null): MusicBrainzReleaseTrack {
  return {
    id: `t${disc}-${position}`,
    recordingId: `r${disc}-${position}`,
    disc,
    position,
    title,
    length: seconds === null ? null : seconds * 1000,
    mapped: { title, trackNumber: position, discNumber: disc, album: 'Album', year: 1997 }
  }
}

const album = [track(1, 1, 'Airbag', 284), track(1, 2, 'Paranoid Android', 387), track(1, 3, 'Subterranean', 268)]

describe('normalizeTitle', () => {
  it('ignores case, accents, punctuation and bracketed additions', () => {
    expect(normalizeTitle('Café del Mar (Remastered 2011)')).toBe('cafe del mar')
    expect(normalizeTitle('Rock & Roll [Live]')).toBe('rock and roll')
    expect(normalizeTitle("Don't Stop")).toBe('don t stop')
  })
})

describe('matchSongsToTracks', () => {
  it('matches by track number on a single-disc release even without a disc number', () => {
    const matches = matchSongsToTracks([song(1, { trackNumber: 2, title: 'Paranoid Android' })], album)

    expect(matches.get(1)).toEqual({ trackId: 't1-2', reason: 'number' })
  })

  it('needs the disc number on a multi-disc release', () => {
    const tracks = [track(1, 1, 'One', 200), track(2, 1, 'Two', 300)]

    expect(matchSongsToTracks([song(1, { trackNumber: 1, discNumber: 2, title: 'Two' })], tracks).get(1)).toEqual({
      trackId: 't2-1',
      reason: 'number'
    })
    // Without a disc number the title decides.
    expect(matchSongsToTracks([song(2, { trackNumber: 1, title: 'Two' })], tracks).get(2)?.reason).toBe('title')
  })

  it('does not trust a number whose title and length both disagree', () => {
    const matches = matchSongsToTracks([song(1, { trackNumber: 1, title: 'Subterranean', duration: 268 })], album)

    expect(matches.get(1)).toEqual({ trackId: 't1-3', reason: 'title' })
  })

  it('falls back to the length when there is neither number nor matching title', () => {
    const matches = matchSongsToTracks([song(1, { title: 'Track 02', duration: 386 })], album)

    expect(matches.get(1)).toEqual({ trackId: 't1-2', reason: 'duration' })
  })

  it('leaves a song unmatched when two tracks are equally close', () => {
    const tracks = [track(1, 1, 'A', 200), track(1, 2, 'B', 200)]

    expect(matchSongsToTracks([song(1, { duration: 200 })], tracks).has(1)).toBe(false)
  })

  it('uses every track only once', () => {
    const matches = matchSongsToTracks(
      [song(1, { trackNumber: 1, title: 'Airbag' }), song(2, { title: 'Airbag' })],
      album
    )

    expect(matches.get(1)?.trackId).toBe('t1-1')
    expect(matches.has(2)).toBe(false)
  })
})

describe('isSameValue', () => {
  it('compares numbers and trimmed strings', () => {
    expect(isSameValue('trackNumber', 2, 2)).toBe(true)
    expect(isSameValue('title', ' Airbag ', 'Airbag')).toBe(true)
    expect(isSameValue('title', null, 'Airbag')).toBe(false)
  })

  it('compares a partial release date only on its known part', () => {
    expect(isSameValue('originalReleaseDate', new Date(1997, 4, 21), '1997')).toBe(true)
    expect(isSameValue('originalReleaseDate', new Date(1997, 4, 21), '1997-05-21')).toBe(true)
    expect(isSameValue('originalReleaseDate', new Date(1997, 4, 21), '1998')).toBe(false)
  })
})

describe('buildApplyItems', () => {
  const songs = [
    song(1, { title: 'Airbag', trackNumber: 1, album: 'Album', year: 1997 }),
    song(2, { title: 'paranoid', trackNumber: 2 })
  ]
  const assignment = new Map([
    [1, 't1-1'],
    [2, 't1-2']
  ])

  it('writes only the chosen fields that change, per song', () => {
    const items = buildApplyItems({
      songs,
      assignment,
      tracks: album,
      fields: new Set(['title', 'album', 'year']),
      withCover: false
    })

    expect(items).toEqual([{ songId: 2, metadata: { title: 'Paranoid Android', album: 'Album', year: 1997 } }])
  })

  it('keeps unchanged songs when a cover is written', () => {
    const items = buildApplyItems({ songs, assignment, tracks: album, fields: new Set(['title']), withCover: true })

    expect(items.map(item => item.songId)).toEqual([1, 2])
    expect(items[0].metadata).toEqual({})
  })

  it('skips songs without a track', () => {
    const items = buildApplyItems({
      songs,
      assignment: new Map([[2, 't1-2']]),
      tracks: album,
      fields: new Set(['title']),
      withCover: true
    })

    expect(items.map(item => item.songId)).toEqual([2])
  })
})

describe('isValidApplyItems', () => {
  it('accepts known fields with plain values', () => {
    expect(isValidApplyItems([{ songId: 1, metadata: { title: 'A', year: 1997 } }])).toBe(true)
    expect(isValidApplyItems([{ songId: 1, metadata: {} }])).toBe(true)
  })

  it('rejects unknown fields, odd values and empty lists', () => {
    expect(isValidApplyItems([])).toBe(false)
    expect(isValidApplyItems([{ songId: 1, metadata: { filePath: '/etc/passwd' } }])).toBe(false)
    expect(isValidApplyItems([{ songId: 1, metadata: { title: { nested: true } } }])).toBe(false)
    expect(isValidApplyItems([{ songId: '1', metadata: {} }])).toBe(false)
  })
})

describe('sortForMatching', () => {
  it('orders by folder, disc, track and file name', () => {
    const sorted = sortForMatching([
      song(1, { discNumber: 2, trackNumber: 1 }),
      song(2, { discNumber: 1, trackNumber: 2 }),
      song(3, { discNumber: 1, trackNumber: 1 })
    ])

    expect(sorted.map(s => s.id)).toEqual([3, 2, 1])
  })
})

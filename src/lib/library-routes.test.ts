import { describe, expect, it } from 'vitest'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import {
  buildFolderHref,
  buildPlaylistHref,
  folderPathToSegments,
  RECENT_LISTENS_ROUTE,
  segmentsToFolderPath
} from './library-routes'

describe('folderPathToSegments', () => {
  it('returns no segments for the all-songs sentinel', () => {
    expect(folderPathToSegments(ALL_SONGS_FOLDER_ID)).toEqual([])
  })

  it('splits an absolute path and drops the leading empty segment', () => {
    expect(folderPathToSegments('/music/Rock/2020')).toEqual(['music', 'Rock', '2020'])
  })

  it('encodes each segment individually', () => {
    expect(folderPathToSegments('/music/Sigur Rós/( )')).toEqual(['music', 'Sigur%20R%C3%B3s', '(%20)'])
  })
})

describe('segmentsToFolderPath', () => {
  it('maps missing or empty segments to the all-songs sentinel', () => {
    expect(segmentsToFolderPath()).toBe(ALL_SONGS_FOLDER_ID)
    expect(segmentsToFolderPath([])).toBe(ALL_SONGS_FOLDER_ID)
  })

  it('decodes the segments the client router hands back', () => {
    expect(segmentsToFolderPath(['music', 'Sigur%20R%C3%B3s'])).toBe('/music/Sigur Rós')
  })

  it('leaves an already decoded segment alone', () => {
    expect(segmentsToFolderPath(['music', 'A folder with music'])).toBe('/music/A folder with music')
  })

  it('keeps a segment that is not valid percent-encoding', () => {
    expect(segmentsToFolderPath(['music', '100% Real'])).toBe('/music/100% Real')
  })

  it('round-trips a path through the segments of its href', () => {
    const folderPath = '/music/Rock/100% Real'

    expect(segmentsToFolderPath(folderPathToSegments(folderPath))).toBe(folderPath)
  })
})

describe('href builders', () => {
  it('builds /library for the all-songs sentinel', () => {
    expect(buildFolderHref(ALL_SONGS_FOLDER_ID)).toBe('/library')
  })

  it('builds an encoded folder href', () => {
    expect(buildFolderHref('/music/Sigur Rós')).toBe('/library/music/Sigur%20R%C3%B3s')
  })

  it('builds a playlist href', () => {
    expect(buildPlaylistHref(12)).toBe('/smart-playlists/12')
  })

  it('points the recent listens view at its own route', () => {
    expect(RECENT_LISTENS_ROUTE).toBe('/listens')
  })
})

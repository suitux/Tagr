import { describe, expect, it } from 'vitest'
import { ALL_SONGS_FOLDER_ID } from '@/features/songs/domain'
import { buildFolderHref, buildPlaylistHref, folderPathToSegments, segmentsToFolderPath } from './library-routes'

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

  it('rebuilds the absolute path from already decoded segments', () => {
    expect(segmentsToFolderPath(['music', 'Sigur Rós'])).toBe('/music/Sigur Rós')
  })

  it('round-trips a path through decoded segments', () => {
    const folderPath = '/music/Rock/100% Real'
    const decoded = folderPathToSegments(folderPath).map(decodeURIComponent)

    expect(segmentsToFolderPath(decoded)).toBe(folderPath)
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
})

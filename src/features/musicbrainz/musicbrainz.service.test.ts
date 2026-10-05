import { describe, expect, it } from 'vitest'
import type { MusicBrainzRecording, MusicBrainzReleaseDetail } from './domain'
import { mapToSongMetadata } from './musicbrainz.service'

const recording = { id: 'rec', title: 'Song' } as MusicBrainzRecording

const releaseWithGroup = (releaseGroup: MusicBrainzReleaseDetail['release-group']): MusicBrainzReleaseDetail => ({
  id: 'rel',
  title: 'Album',
  'release-group': releaseGroup
})

describe('mapToSongMetadata releaseType', () => {
  it('joins the primary and secondary types, lowercased like Picard', () => {
    const release = releaseWithGroup({ 'primary-type': 'Album', 'secondary-types': ['Live', 'Compilation'] })

    expect(mapToSongMetadata(recording, release, 'rec').releaseType).toBe('album;live;compilation')
  })

  it('uses the primary type alone when there are no secondary types', () => {
    const release = releaseWithGroup({ 'primary-type': 'EP' })

    expect(mapToSongMetadata(recording, release, 'rec').releaseType).toBe('ep')
  })

  it('leaves the field out when the release group has no type', () => {
    expect(mapToSongMetadata(recording, releaseWithGroup(undefined), 'rec').releaseType).toBeUndefined()
  })
})

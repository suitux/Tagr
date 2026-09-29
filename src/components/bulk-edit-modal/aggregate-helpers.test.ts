import { describe, it, expect } from 'vitest'
import { MIXED, computeCustomAggregate } from './aggregate-helpers'
import type { Song } from '@/features/songs/domain'

type MetadataRow = { key: string; value: string | null }

function song(id: number, metadata?: MetadataRow[]): Song {
  return { id, ...(metadata && { metadata }) } as unknown as Song
}

describe('computeCustomAggregate', () => {
  it('returns the shared value when every song agrees', () => {
    const songs = [song(1, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }]), song(2, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }])]

    expect(computeCustomAggregate(songs, 'SOURCEMEDIA', false)).toBe('Vinyl')
  })

  it('is mixed when the songs disagree', () => {
    const songs = [song(1, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }]), song(2, [{ key: 'SOURCEMEDIA', value: 'CD' }])]

    expect(computeCustomAggregate(songs, 'SOURCEMEDIA', false)).toBe(MIXED)
  })

  it('is null when no song carries the tag', () => {
    expect(computeCustomAggregate([song(1, []), song(2, [{ key: 'MOOD', value: 'Calm' }])], 'SOURCEMEDIA', false)).toBe(
      null
    )
  })

  it('strips the tag key prefix before comparing', () => {
    const songs = [
      song(1, [{ key: 'TXXX:SOURCEMEDIA', value: 'Vinyl' }]),
      song(2, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }])
    ]

    expect(computeCustomAggregate(songs, 'SOURCEMEDIA', false)).toBe('Vinyl')
  })

  it('is mixed when a song was loaded without its extended tags', () => {
    const songs = [song(1, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }]), song(2)]

    expect(computeCustomAggregate(songs, 'SOURCEMEDIA', false)).toBe(MIXED)
  })

  it('is mixed when the selection is only partially loaded', () => {
    expect(computeCustomAggregate([song(1, [{ key: 'SOURCEMEDIA', value: 'Vinyl' }])], 'SOURCEMEDIA', true)).toBe(MIXED)
  })
})

import { describe, it, expect } from 'vitest'
import { buildBulkPatch, isEmptyBulkPatch, type FormShape } from './build-patch'
import type { BulkFormFieldKey } from '@/features/songs/song-fields'

const form = (values: Partial<FormShape>): FormShape => values as FormShape

const touched = (...keys: BulkFormFieldKey[]) => new Set(keys)

describe('buildBulkPatch', () => {
  it('splits standard fields and extended tags', () => {
    const patch = buildBulkPatch(
      form({ artist: 'Bowie', year: '1977', 'custom:SOURCEMEDIA': 'Vinyl' }),
      touched('artist', 'year', 'custom:SOURCEMEDIA')
    )

    expect(patch.metadata).toEqual({ artist: 'Bowie', year: 1977 })
    expect(patch.customMetadata).toEqual([{ key: 'SOURCEMEDIA', value: 'Vinyl' }])
  })

  it('ignores untouched fields', () => {
    const patch = buildBulkPatch(form({ artist: 'Bowie', 'custom:MOOD': 'Calm' }), touched('artist'))

    expect(patch.metadata).toEqual({ artist: 'Bowie' })
    expect(patch.customMetadata).toEqual([])
  })

  it('clears a standard field and removes an extended tag when emptied', () => {
    const patch = buildBulkPatch(form({ comment: '', 'custom:MOOD': '' }), touched('comment', 'custom:MOOD'))

    expect(patch.metadata).toEqual({ comment: null })
    expect(patch.customMetadata).toEqual([{ key: 'MOOD', value: null }])
  })

  it('converts booleans and keeps dates as ISO strings', () => {
    const patch = buildBulkPatch(
      form({ compilation: 'true', originalReleaseDate: '1977-10-14' }),
      touched('compilation', 'originalReleaseDate')
    )

    expect(patch.metadata).toEqual({ compilation: true, originalReleaseDate: '1977-10-14' })
  })

  it('drops a non-numeric value for a numeric field', () => {
    expect(buildBulkPatch(form({ bpm: 'fast' }), touched('bpm')).metadata).toEqual({})
  })
})

describe('isEmptyBulkPatch', () => {
  it('is true only when neither part carries a change', () => {
    expect(isEmptyBulkPatch({ metadata: {}, customMetadata: [] })).toBe(true)
    expect(isEmptyBulkPatch({ metadata: {}, customMetadata: [{ key: 'MOOD', value: null }] })).toBe(false)
    expect(isEmptyBulkPatch({ metadata: { artist: 'Bowie' }, customMetadata: [] })).toBe(false)
  })
})

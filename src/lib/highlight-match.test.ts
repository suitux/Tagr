import { describe, expect, it } from 'vitest'
import { splitHighlightSegments } from './highlight-match'

const matched = (text: string, query: string) =>
  splitHighlightSegments(text, query)
    .filter(segment => segment.match)
    .map(segment => segment.text)

describe('splitHighlightSegments', () => {
  it('always rebuilds the original text', () => {
    const text = 'Karma Police (live, remastered)'
    expect(
      splitHighlightSegments(text, 'karma police')
        .map(segment => segment.text)
        .join('')
    ).toBe(text)
  })

  it('marks the query inside a longer title', () => {
    expect(matched('Karma Police (live)', 'Karma Police')).toEqual(['Karma Police'])
  })

  it('ignores case and diacritics without altering the rendered text', () => {
    expect(matched('ÉXTASIS (remix)', 'extasis')).toEqual(['ÉXTASIS'])
  })

  it('bridges the separators between two matches so the stroke is continuous', () => {
    expect(matched('Police, Karma', 'Karma Police')).toEqual(['Police, Karma'])
  })

  it('does not bridge across a word that did not match', () => {
    expect(matched('Karma is Police', 'Karma Police')).toEqual(['Karma', 'Police'])
  })

  it('drops single-character terms that would match everything', () => {
    expect(matched('A Day in the Life', 'A Day')).toEqual(['Day'])
  })

  it('keeps single-character terms when that is the whole query', () => {
    expect(matched('9 Crimes', '9')).toEqual(['9'])
  })

  it('returns one unmatched segment when there is nothing to highlight', () => {
    expect(splitHighlightSegments('Creep', '')).toEqual([{ text: 'Creep', match: false }])
    expect(matched('Creep', 'Paranoid')).toEqual([])
  })

  it('returns nothing for an empty text', () => {
    expect(splitHighlightSegments('', 'Creep')).toEqual([])
  })
})

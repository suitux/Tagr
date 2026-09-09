/**
 * Splits a string into the runs that match a search query and the runs that do not, so the UI can
 * highlight what the user typed inside a longer result title.
 *
 * Matching is case- and diacritic-insensitive and works term by term, which is what makes it
 * useful on MusicBrainz titles: searching "Karma Police" still highlights the words inside
 * "Karma Police (live, remastered)".
 */

export interface HighlightSegment {
  text: string
  match: boolean
}

/** Anything that is not a letter or a digit separates one search term from the next. */
const SEPARATOR = /[^\p{L}\p{N}]/u

/**
 * Single-character terms match almost everything, so they are dropped — unless the whole query is
 * made of them, in which case highlighting nothing would be worse.
 */
const MIN_TERM_LENGTH = 2

/**
 * Folds one character for comparison: lowercase, without its diacritics. Kept per character (and
 * per code point) so the folded array stays aligned with the original one and the segments can be
 * rebuilt from the untouched input.
 */
function foldChar(char: string): string {
  return char.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase() || char.toLowerCase()
}

function toFoldedChars(value: string): string[] {
  return Array.from(value, foldChar)
}

function toTerms(query: string): string[][] {
  const chars = Array.from(query)
  const folded = toFoldedChars(query)

  const terms: string[][] = []
  let current: string[] = []

  chars.forEach((char, index) => {
    if (SEPARATOR.test(char)) {
      if (current.length) terms.push(current)
      current = []
      return
    }
    current.push(folded[index])
  })
  if (current.length) terms.push(current)

  const longEnough = terms.filter(term => term.length >= MIN_TERM_LENGTH)
  return longEnough.length ? longEnough : terms
}

/** True when `term` sits at `start` of `chars`, comparing the already folded characters. */
function matchesAt(chars: string[], term: string[], start: number): boolean {
  return term.every((char, offset) => chars[start + offset] === char)
}

/**
 * Marks the separators that sit between two matches ("Karma Police" is one highlighter stroke,
 * not two with a gap). Only runs made purely of separators are bridged, so real words in between
 * are left alone.
 */
function bridgeSeparators(chars: string[], matched: boolean[]): void {
  let index = 0

  while (index < chars.length) {
    if (matched[index]) {
      index++
      continue
    }

    let end = index
    while (end < chars.length && !matched[end] && SEPARATOR.test(chars[end])) end++

    const bounded = index > 0 && end < chars.length && matched[index - 1] && matched[end]
    if (bounded) {
      for (let i = index; i < end; i++) matched[i] = true
    }

    index = Math.max(end, index + 1)
  }
}

/**
 * Returns the consecutive runs of `text`, each flagged as matching the query or not. An empty
 * query (or an empty text) yields a single non-matching segment, so callers can always render
 * the result the same way.
 */
export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  const chars = Array.from(text)
  if (!chars.length) return []

  const terms = toTerms(query)
  if (!terms.length) return [{ text, match: false }]

  const folded = toFoldedChars(text)
  const matched = new Array<boolean>(chars.length).fill(false)

  for (const term of terms) {
    for (let start = 0; start <= folded.length - term.length; start++) {
      if (!matchesAt(folded, term, start)) continue
      for (let offset = 0; offset < term.length; offset++) matched[start + offset] = true
    }
  }

  bridgeSeparators(chars, matched)

  const segments: HighlightSegment[] = []
  chars.forEach((char, index) => {
    const previous = segments[segments.length - 1]
    if (previous && previous.match === matched[index]) {
      previous.text += char
      return
    }
    segments.push({ text: char, match: matched[index] })
  })

  return segments
}

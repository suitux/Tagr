'use client'

import { useMemo } from 'react'
import { splitHighlightSegments } from '@/lib/highlight-match'

interface HighlightedTextProps {
  text: string
  /** What the user searched for. Empty renders `text` untouched. */
  query: string
  className?: string
}

/**
 * Renders `text` with the parts matching `query` picked out in highlighter yellow, so the result
 * the user was after stands out in a long list. See `splitHighlightSegments` for how loose the
 * matching is.
 */
export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  const segments = useMemo(() => splitHighlightSegments(text, query), [text, query])

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.match ? (
          // `text-inherit` undoes the black the browser forces on <mark>, unreadable in dark mode.
          <mark key={index} className='rounded-[2px] bg-yellow-500/30 text-inherit dark:bg-yellow-500/25'>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </span>
  )
}

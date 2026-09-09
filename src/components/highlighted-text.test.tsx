import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HighlightedText } from './highlighted-text'

describe('HighlightedText', () => {
  it('marks the searched words and leaves the rest alone', () => {
    const { container } = render(<HighlightedText text='In Silence (test)' query='In Silence (Original Mix)' />)

    expect(container.textContent).toBe('In Silence (test)')
    expect(screen.getByText('In Silence').tagName).toBe('MARK')
  })

  it('renders the text untouched when there is no query', () => {
    const { container } = render(<HighlightedText text='In Silence' query='' />)

    expect(container.textContent).toBe('In Silence')
    expect(container.querySelector('mark')).toBeNull()
  })

  it('passes its className to the wrapper', () => {
    const { container } = render(<HighlightedText text='Creep' query='Creep' className='font-medium' />)

    expect(container.firstElementChild).toHaveClass('font-medium')
  })
})

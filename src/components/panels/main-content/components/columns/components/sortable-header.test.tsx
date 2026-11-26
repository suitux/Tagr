import { describe, expect, it, vi } from 'vitest'
import type { Column } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import { FILTER_MIN_COLUMN_WIDTH, SortableHeader } from './sortable-header'

vi.mock('./tag-filter-input', () => ({
  TagFilterInput: () => <input data-testid='column-filter' />
}))

function renderHeader(size: number, props: { enableColumnFilter?: boolean } = {}) {
  const column = { id: 'artist', getSize: () => size, getIsSorted: () => false, toggleSorting: vi.fn() }
  return render(<SortableHeader column={column as unknown as Column<unknown>} label='Artist' {...props} />)
}

describe('SortableHeader filter', () => {
  it('shows the filter while the column is wide enough', () => {
    renderHeader(FILTER_MIN_COLUMN_WIDTH + 1)

    expect(screen.getByTestId('column-filter')).toBeInTheDocument()
  })

  it.each([FILTER_MIN_COLUMN_WIDTH, 30])('hides the filter at %ipx, keeping the sort button', size => {
    renderHeader(size)

    expect(screen.queryByTestId('column-filter')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Artist' })).toBeInTheDocument()
  })

  it('never shows it for a column that has no filter', () => {
    renderHeader(300, { enableColumnFilter: false })

    expect(screen.queryByTestId('column-filter')).not.toBeInTheDocument()
  })
})

import { describe, expect, it, vi } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { act, fireEvent, render } from '@testing-library/react'
import { DataTable } from './data-table'

interface Row {
  id: number
  title: string
  artist: string
}

const columns: ColumnDef<Row>[] = [
  { id: 'title', accessorKey: 'title', header: 'Title', size: 200 },
  { id: 'artist', accessorKey: 'artist', header: 'Artist', size: 150 }
]

const data: Row[] = [{ id: 1, title: 'One', artist: 'A' }]

function renderTable(props: Partial<React.ComponentProps<typeof DataTable<Row, unknown>>> = {}) {
  const view = render(
    <div style={{ height: 400 }}>
      <DataTable columns={columns} data={data} getRowId={row => String(row.id)} {...props} />
    </div>
  )
  const headers = () => [...view.container.querySelectorAll('th')] as HTMLElement[]
  return { ...view, headers }
}

function drag(handle: Element, from: number, to: number) {
  fireEvent.mouseDown(handle, { clientX: from })
  act(() => {
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: to }))
  })
  act(() => {
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: to }))
  })
}

describe('DataTable column widths', () => {
  it('uses each column default width when nothing is stored', () => {
    const { headers } = renderTable()

    expect(headers().map(th => th.style.width)).toEqual(['200px', '150px'])
  })

  it('starts from the stored widths, leaving the other columns at their default', () => {
    const { headers } = renderTable({ initialColumnSizing: { artist: 320 } })

    expect(headers().map(th => th.style.width)).toEqual(['200px', '320px'])
  })

  it('reports the new widths once, when the resize ends', () => {
    const onColumnSizingCommit = vi.fn()
    const { headers } = renderTable({ initialColumnSizing: { artist: 320 }, onColumnSizingCommit })

    drag(headers()[0].querySelector('[role="button"]')!, 100, 160)

    expect(headers()[0].style.width).toBe('260px')
    expect(onColumnSizingCommit).toHaveBeenCalledTimes(1)
    expect(onColumnSizingCommit).toHaveBeenCalledWith({ title: 260, artist: 320 })
  })

  it('reports nothing while the table is only rendered', () => {
    const onColumnSizingCommit = vi.fn()
    renderTable({ onColumnSizingCommit })

    expect(onColumnSizingCommit).not.toHaveBeenCalled()
  })
})

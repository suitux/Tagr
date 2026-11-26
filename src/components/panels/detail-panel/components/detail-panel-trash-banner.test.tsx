import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Song } from '@/features/songs/domain'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailPanelTrashBanner } from './detail-panel-trash-banner'

const { mockSession, mockRestore, mockDeletePermanently } = vi.hoisted(() => ({
  mockSession: { data: null as { user: { role: string } } | null },
  mockRestore: vi.fn(),
  mockDeletePermanently: vi.fn()
}))

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession
}))

vi.mock('@/features/trash/hooks/use-trash-actions', () => ({
  useTrashActions: () => ({ restore: mockRestore, deletePermanently: mockDeletePermanently })
}))

const song = { id: 12, title: 'Trashed' } as Song

function renderBanner(role: string) {
  mockSession.data = { user: { role } }
  return render(<DetailPanelTrashBanner song={song} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DetailPanelTrashBanner', () => {
  it('tells everyone why the song cannot be edited', () => {
    renderBanner('listener')

    expect(screen.getByText('trash.readOnlyNotice')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('lets a tagger restore but not delete for good', async () => {
    const user = userEvent.setup()
    renderBanner('tagger')

    expect(screen.queryByRole('button', { name: 'trash.actions.delete' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'trash.actions.restore' }))

    expect(mockRestore).toHaveBeenCalledWith({ mode: 'ids', songIds: [12] })
  })

  it('lets an admin delete the song for good', async () => {
    const user = userEvent.setup()
    renderBanner('admin')

    await user.click(screen.getByRole('button', { name: 'trash.actions.delete' }))

    expect(mockDeletePermanently).toHaveBeenCalledWith({ mode: 'ids', songIds: [12] }, 1)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailPanelRow } from './detail-panel-row'

const { mockSession } = vi.hoisted(() => ({
  mockSession: { data: null as { user: { role: string } } | null }
}))

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession
}))

const mockUpdateSong = vi.fn()
vi.mock('@/features/songs/hooks/use-update-song', () => ({
  useUpdateSong: () => ({ mutate: mockUpdateSong, isPending: false })
}))

const icon = <span data-testid='icon'>🎵</span>

function renderRow(role: string, props: Record<string, unknown> = {}) {
  mockSession.data = { user: { role } }
  return render(<DetailPanelRow icon={icon} label='Title' value='Test Song' fieldName='title' songId={1} {...props} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DetailPanelRow - role-based editing', () => {
  describe('edit button', () => {
    it('tagger sees the edit button', () => {
      const { container } = renderRow('tagger')
      expect(container.querySelector('.lucide-pencil')).toBeInTheDocument()
    })

    it('admin sees the edit button', () => {
      const { container } = renderRow('admin')
      expect(container.querySelector('.lucide-pencil')).toBeInTheDocument()
    })

    it('listener does not see the edit button', () => {
      const { container } = renderRow('listener')
      expect(container.querySelector('.lucide-pencil')).not.toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('tagger can enter edit mode by clicking the edit button', async () => {
      const user = userEvent.setup()
      const { container } = renderRow('tagger')

      const editBtn = container.querySelector('.lucide-pencil')!.closest('button')!
      await user.click(editBtn)

      expect(screen.getByDisplayValue('Test Song')).toBeInTheDocument()
    })

    it('tagger can save edits', async () => {
      const user = userEvent.setup()
      const { container } = renderRow('tagger')

      const editBtn = container.querySelector('.lucide-pencil')!.closest('button')!
      await user.click(editBtn)

      const input = screen.getByDisplayValue('Test Song')
      await user.clear(input)
      await user.type(input, 'New Title')

      // Submit via Enter
      await user.keyboard('{Enter}')

      expect(mockUpdateSong).toHaveBeenCalledWith({ id: 1, metadata: { title: 'New Title' } }, expect.any(Object))
    })
  })

  describe('extra metadata delete button', () => {
    it('tagger sees delete button on extra metadata', () => {
      const { container } = renderRow('tagger', {
        fieldName: 'CUSTOM_TAG',
        isExtraMetadata: true
      })
      expect(container.querySelector('.lucide-trash')).toBeInTheDocument()
    })

    it('listener does not see delete button on extra metadata', () => {
      const { container } = renderRow('listener', {
        fieldName: 'CUSTOM_TAG',
        isExtraMetadata: true
      })
      // Delete button for extra metadata is always visible regardless of role
      expect(container.querySelector('.lucide-trash')).not.toBeInTheDocument()
    })
  })

  describe('boolean type', () => {
    it('tagger can toggle a boolean field', () => {
      renderRow('tagger', { type: 'boolean', value: false })
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeDisabled()
    })

    it('listener cannot toggle a boolean field', () => {
      renderRow('listener', { type: 'boolean', value: false })
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('empty value click-to-edit', () => {
    it('tagger can click empty value area to start editing', async () => {
      const user = userEvent.setup()
      renderRow('tagger', { value: '' })

      // The empty value div should be clickable for taggers
      const editableArea = screen.getByText('Title').parentElement!.querySelector('.cursor-pointer')
      expect(editableArea).toBeInTheDocument()

      await user.click(editableArea!)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('listener cannot click empty value area to edit', () => {
      renderRow('listener', { value: '' })

      const editableArea = screen.getByText('Title').parentElement!.querySelector('.cursor-pointer')
      expect(editableArea).not.toBeInTheDocument()
    })
  })
})

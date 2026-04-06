import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FolderListHeaderMenu } from './folder-list-header-menu'

const { mockSession } = vi.hoisted(() => ({
  mockSession: { data: null as { user: { role: string } } | null }
}))

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  signOut: vi.fn()
}))

vi.mock('@/features/scan/hooks/use-scan', () => ({
  useScan: () => ({ isPending: false, confirmQuickScan: vi.fn(), confirmFullScan: vi.fn() })
}))

const defaultProps = {
  onOpenHistory: vi.fn(),
  onOpenUserManagement: vi.fn()
}

async function renderAndOpenMenu(role: string) {
  mockSession.data = { user: { role } }
  const user = userEvent.setup()
  render(<FolderListHeaderMenu {...defaultProps} />)
  await user.click(screen.getByRole('button'))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FolderListHeaderMenu - role-based actions', () => {
  describe('admin role', () => {
    it('shows rescan, history, and manage users', async () => {
      await renderAndOpenMenu('admin')

      expect(screen.getByText('folders.rescan')).toBeInTheDocument()
      expect(screen.getByText('folders.history')).toBeInTheDocument()
      expect(screen.getByText('folders.manageUsers')).toBeInTheDocument()
    })
  })

  describe('tagger role', () => {
    it('shows rescan and history but not manage users', async () => {
      await renderAndOpenMenu('tagger')

      expect(screen.getByText('folders.rescan')).toBeInTheDocument()
      expect(screen.getByText('folders.history')).toBeInTheDocument()
      expect(screen.queryByText('folders.manageUsers')).not.toBeInTheDocument()
    })
  })

  describe('listener role', () => {
    it('does not show rescan, history, or manage users', async () => {
      await renderAndOpenMenu('listener')

      expect(screen.queryByText('folders.rescan')).not.toBeInTheDocument()
      expect(screen.queryByText('folders.history')).not.toBeInTheDocument()
      expect(screen.queryByText('folders.manageUsers')).not.toBeInTheDocument()
    })
  })

  describe('all roles', () => {
    it.each(['admin', 'tagger', 'listener'])('%s always sees logout and feedback', async role => {
      await renderAndOpenMenu(role)

      expect(screen.getByText('common.logout')).toBeInTheDocument()
      expect(screen.getByText('folders.feedback')).toBeInTheDocument()
    })
  })
})

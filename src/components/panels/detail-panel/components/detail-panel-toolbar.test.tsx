import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Song } from '@/features/songs/domain'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailPanelToolbar } from './detail-panel-toolbar'

const { mockSession } = vi.hoisted(() => ({
  mockSession: { data: null as { user: { role: string } } | null }
}))

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession
}))

vi.mock('@/features/songs/hooks/use-rescan-song', () => ({
  useRescanSong: () => ({ mutate: vi.fn(), isPending: false })
}))

vi.mock('@/hooks/use-selected-song', () => ({
  useSelectedSong: () => ({ setSelectedSongId: vi.fn() })
}))

vi.mock('@/components/history-modal/history-modal', () => ({
  HistoryModal: () => null
}))

const mockSong = { id: 1, title: 'Test Song' } as Song

const defaultProps = {
  song: mockSong,
  displayTitle: 'Test Song',
  onShare: vi.fn(),
  onMusicBrainzLookup: vi.fn(),
  onDownloadCover: vi.fn(),
  onEditCover: vi.fn()
}

function renderToolbar(role: string) {
  mockSession.data = { user: { role } }
  return render(
    <TooltipProvider>
      <DetailPanelToolbar {...defaultProps} />
    </TooltipProvider>
  )
}

async function renderAndOpenMobileMenu(role: string) {
  mockSession.data = { user: { role } }
  const user = userEvent.setup()
  render(
    <TooltipProvider>
      <DetailPanelToolbar {...defaultProps} />
    </TooltipProvider>
  )
  // Mobile dropdown trigger is inside md:hidden div
  const dropdownButtons = screen.getAllByRole('button')
  const mobileMenuButton = dropdownButtons.find(b => b.querySelector('.lucide-ellipsis-vertical'))!
  await user.click(mobileMenuButton)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DetailPanelToolbar - role-based actions', () => {
  describe('desktop buttons', () => {
    it('tagger sees rescan, musicbrainz, and history buttons', () => {
      const { container } = renderToolbar('tagger')
      const desktop = container.querySelector('.hidden.md\\:flex')!

      expect(desktop.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
      expect(desktop.querySelector('.lucide-history')).toBeInTheDocument()
      expect(screen.getByTestId('musicbrainz-icon')).toBeInTheDocument()
    })

    it('admin sees rescan, musicbrainz, and history buttons', () => {
      const { container } = renderToolbar('admin')
      const desktop = container.querySelector('.hidden.md\\:flex')!

      expect(desktop.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
      expect(desktop.querySelector('.lucide-history')).toBeInTheDocument()
      expect(screen.getByTestId('musicbrainz-icon')).toBeInTheDocument()
    })

    it('listener does not see rescan, musicbrainz, or history buttons', () => {
      const { container } = renderToolbar('listener')
      const desktop = container.querySelector('.hidden.md\\:flex')!

      expect(desktop.querySelector('.lucide-refresh-cw')).not.toBeInTheDocument()
      expect(desktop.querySelector('.lucide-history')).not.toBeInTheDocument()
      expect(screen.queryByTestId('musicbrainz-icon')).not.toBeInTheDocument()
    })

    it('all roles see share button', () => {
      for (const role of ['admin', 'tagger', 'listener']) {
        const { container, unmount } = renderToolbar(role)
        const desktop = container.querySelector('.hidden.md\\:flex')!
        expect(desktop.querySelector('.lucide-share-2')).toBeInTheDocument()
        unmount()
      }
    })
  })

  describe('mobile dropdown', () => {
    it('tagger sees edit cover, rescan, and history', async () => {
      await renderAndOpenMobileMenu('tagger')

      expect(screen.getByText('previewCard.editCover')).toBeInTheDocument()
      expect(screen.getByText('history.rescanSong')).toBeInTheDocument()
      expect(screen.getByText('history.viewHistory')).toBeInTheDocument()
    })

    it('listener only sees download cover', async () => {
      await renderAndOpenMobileMenu('listener')

      expect(screen.getByText('previewCard.downloadCover')).toBeInTheDocument()
      expect(screen.queryByText('previewCard.editCover')).not.toBeInTheDocument()
      expect(screen.queryByText('history.rescanSong')).not.toBeInTheDocument()
      expect(screen.queryByText('history.viewHistory')).not.toBeInTheDocument()
    })

    it.each(['admin', 'tagger', 'listener'])('%s sees download cover', async role => {
      await renderAndOpenMobileMenu(role)
      expect(screen.getByText('previewCard.downloadCover')).toBeInTheDocument()
    })
  })
})

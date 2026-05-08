'use client'

import { ImageIcon, PencilIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface BulkActionBarPillProps {
  count: number
  busy: boolean
  onCancel: () => void
  onEdit: () => void
  onFetchCovers: () => void
}

export function BulkActionBarPill({ count, busy, onCancel, onEdit, onFetchCovers }: BulkActionBarPillProps) {
  const tBulk = useTranslations('bulkEdit')
  const breakpoint = useBreakpoint()
  const hasPlayer = usePlayerStore(s => s.currentSong) !== null
  const isMobile = breakpoint !== 'desktop'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 sm:px-4',
        // Desktop: small offset from bottom.
        'bottom-6',
        // Mobile/tablet: clear the bottom nav (56px) + small gap.
        isMobile && (hasPlayer ? 'bottom-[8.25rem]' : 'bottom-[4.5rem]')
      )}
      style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined }}
      data-slot='bulk-action-bar'>
      <div className='pointer-events-auto flex w-full max-w-[min(calc(100vw-1.5rem),32rem)] items-center gap-2 rounded-full border border-primary/30 bg-popover/95 px-2.5 py-2 text-popover-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] ring-1 ring-foreground/10 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-200 sm:w-auto sm:max-w-none sm:gap-2.5 sm:px-3'>
        <Button variant='ghost' size='icon-sm' onClick={onCancel} aria-label={tBulk('actionBar.cancel')}>
          <XIcon />
        </Button>
        <div className='flex min-w-0 flex-1 items-center gap-2 pr-1 sm:flex-none'>
          <span className='truncate text-xs font-semibold sm:text-sm'>
            {tBulk('actionBar.selectedCount', { count })}
          </span>
        </div>
        <span className='hidden h-5 w-px bg-border sm:block' />
        <Button size='sm' onClick={onEdit} disabled={count === 0 || busy} aria-label={tBulk('actionBar.edit')}>
          <PencilIcon />
          <span className='hidden sm:inline'>{tBulk('actionBar.edit')}</span>
        </Button>
        <Button
          variant='secondary'
          size='sm'
          onClick={onFetchCovers}
          disabled={count === 0 || busy}
          aria-label={tBulk('actionBar.fetchCovers')}>
          <ImageIcon />
          <span className='hidden sm:inline'>{tBulk('actionBar.fetchCovers')}</span>
        </Button>
      </div>
    </div>
  )
}

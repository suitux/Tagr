'use client'

import { CheckIcon, GripVerticalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface PlaylistReorderBarProps {
  onDone: () => void
}

export function PlaylistReorderBar({ onDone }: PlaylistReorderBarProps) {
  const t = useTranslations('playlists')
  const breakpoint = useBreakpoint()
  const hasPlayer = usePlayerStore(s => s.currentSong) !== null
  const isMobile = breakpoint !== 'desktop'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 sm:px-4',
        'bottom-6',
        isMobile && (hasPlayer ? 'bottom-[8.25rem]' : 'bottom-[4.5rem]')
      )}
      style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined }}
      data-slot='playlist-reorder-bar'>
      <div className='pointer-events-auto flex w-full max-w-[min(calc(100vw-1.5rem),32rem)] items-center gap-2 rounded-full border border-primary/30 bg-popover/95 px-2.5 py-2 text-popover-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] ring-1 ring-foreground/10 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-200 sm:w-auto sm:max-w-none sm:gap-2.5 sm:px-3'>
        <div className='flex min-w-0 flex-1 items-center gap-2 pl-1 pr-1 sm:flex-none'>
          <GripVerticalIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
          <span className='truncate text-xs font-semibold sm:text-sm'>{t('reorderHint')}</span>
        </div>
        <span className='hidden h-5 w-px bg-border sm:block' />
        <Button size='sm' onClick={onDone}>
          <CheckIcon />
          <span>{t('disableReorder')}</span>
        </Button>
      </div>
    </div>
  )
}

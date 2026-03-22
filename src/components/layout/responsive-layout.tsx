'use client'

import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { cn } from '@/lib/utils'
import { useMobileNavStore } from '@/stores/mobile-nav-store'
import { usePlayerStore } from '@/stores/player-store'
import { MobileBottomNav } from '../mobile-bottom-nav'
import { MobilePlayer } from '../mobile-player'
import { FullScreenPanel } from './full-screen-panel'
import { ThreeColumnLayout } from './three-column-layout'

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode
  main?: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({ sidebar, main, detail, className }: ResponsiveLayoutProps) {
  const breakpoint = useBreakpoint()
  const { folderSheetOpen, detailSheetOpen, setFolderSheetOpen, setDetailSheetOpen } = useMobileNavStore()
  const { selectedSongId } = useSelectedSong()
  const hasPlayer = usePlayerStore(s => s.currentSong) !== null

  if (breakpoint === 'desktop') {
    return <ThreeColumnLayout sidebar={sidebar} main={main} detail={detail} className={className} />
  }

  return (
    <div className={cn('h-screen w-full overflow-hidden bg-background', hasPlayer ? 'pb-28' : 'pb-14', className)}>
      <div className='h-full overflow-y-auto'>{main}</div>

      <FullScreenPanel
        open={folderSheetOpen}
        onClose={() => setFolderSheetOpen(false)}
        side='left'
        hasPlayer={hasPlayer}>
        {sidebar}
      </FullScreenPanel>

      <FullScreenPanel
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        side='right'
        hasPlayer={hasPlayer}
        scrollKey={selectedSongId}>
        {detail}
      </FullScreenPanel>

      <MobilePlayer />
      <MobileBottomNav hasDetail={!!detail} />
    </div>
  )
}

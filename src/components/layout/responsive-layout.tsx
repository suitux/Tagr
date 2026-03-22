'use client'

import { useEffect } from 'react'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { cn } from '@/lib/utils'
import { useMobileNavStore } from '@/stores/mobile-nav-store'
import { MobileBottomNav } from './mobile-bottom-nav'
import { ThreeColumnLayout } from './three-column-layout'

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode
  main?: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

function FullScreenPanel({
  open,
  onClose,
  side,
  children
}: {
  open: boolean
  onClose: () => void
  side: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed inset-x-0 top-0 bottom-14 z-50 w-full bg-background transition-transform duration-300 ease-in-out overflow-y-auto',
          side === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}>
        {children}
      </div>
    </>
  )
}

export function ResponsiveLayout({ sidebar, main, detail, className }: ResponsiveLayoutProps) {
  const breakpoint = useBreakpoint()
  const { folderSheetOpen, detailSheetOpen, setFolderSheetOpen, setDetailSheetOpen } = useMobileNavStore()
  const { selectedFolderId } = useSelectedFolder()

  useEffect(() => {
    if (breakpoint !== 'desktop' && detail) {
      setDetailSheetOpen(true)
    }
  }, [detail, breakpoint, setDetailSheetOpen])

  useEffect(() => {
    if (breakpoint === 'mobile') {
      setFolderSheetOpen(false)
    }
  }, [selectedFolderId, breakpoint, setFolderSheetOpen])

  if (breakpoint === 'desktop') {
    return <ThreeColumnLayout sidebar={sidebar} main={main} detail={detail} className={className} />
  }

  return (
    <div className={cn('h-screen w-full overflow-hidden bg-background pb-14', className)}>
      <div className='h-full overflow-y-auto'>{main}</div>

      <FullScreenPanel open={folderSheetOpen} onClose={() => setFolderSheetOpen(false)} side='left'>
        {sidebar}
      </FullScreenPanel>

      <FullScreenPanel open={detailSheetOpen} onClose={() => setDetailSheetOpen(false)} side='right'>
        {detail}
      </FullScreenPanel>

      <MobileBottomNav hasDetail={!!detail} />
    </div>
  )
}

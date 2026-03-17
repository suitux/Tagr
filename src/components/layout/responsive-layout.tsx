'use client'

import { useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
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

export function ResponsiveLayout({ sidebar, main, detail, className }: ResponsiveLayoutProps) {
  const breakpoint = useBreakpoint()
  const { folderSheetOpen, detailSheetOpen, setFolderSheetOpen, setDetailSheetOpen } = useMobileNavStore()
  const { selectedFolderId } = useSelectedFolder()

  // Auto-open detail sheet when a song is selected (mobile/tablet)
  useEffect(() => {
    if (breakpoint !== 'desktop' && detail) {
      setDetailSheetOpen(true)
    }
  }, [detail, breakpoint, setDetailSheetOpen])

  // Auto-close folder sheet on folder change (mobile)
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

      <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
        <SheetContent side='left' className='w-[85vw] max-w-[350px] p-0 overflow-y-auto' showCloseButton={false}>
          {sidebar}
        </SheetContent>
      </Sheet>

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side='right' className='w-[90vw] max-w-[400px] p-0 overflow-y-auto' showCloseButton={false}>
          {detail}
        </SheetContent>
      </Sheet>

      <MobileBottomNav hasDetail={!!detail} />
    </div>
  )
}

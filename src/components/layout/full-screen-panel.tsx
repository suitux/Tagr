import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FullScreenPanelProps {
  open: boolean
  side: 'left' | 'right'
  hasPlayer: boolean
  scrollKey?: string | number | null
  children: React.ReactNode
}

export function FullScreenPanel({ open, side, hasPlayer, scrollKey, children }: FullScreenPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.scrollTop = 0
      const viewport = panelRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) viewport.scrollTop = 0
    }
  }, [open, scrollKey])

  return (
    <>
      <div
        ref={panelRef}
        className={cn(
          'fixed inset-x-0 top-0 z-30 w-full bg-background transition-transform duration-300 ease-in-out overflow-y-auto',
          hasPlayer ? 'bottom-28' : 'bottom-14',
          side === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}>
        {children}
      </div>
    </>
  )
}

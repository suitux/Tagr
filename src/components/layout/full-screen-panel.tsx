import { cn } from '@/lib/utils'

interface FullScreenPanelProps {
  open: boolean
  onClose: () => void
  side: 'left' | 'right'
  hasPlayer: boolean
  children: React.ReactNode
}

export function FullScreenPanel({ open, onClose, side, hasPlayer, children }: FullScreenPanelProps) {
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
          'fixed inset-x-0 top-0 z-50 w-full bg-background transition-transform duration-300 ease-in-out overflow-y-auto',
          hasPlayer ? 'bottom-28' : 'bottom-14',
          side === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}>
        {children}
      </div>
    </>
  )
}

'use client'

import { SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SkipButtonProps {
  direction: 'back' | 'forward'
  onSkip: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { button: 'h-7 w-7', icon: 'h-3.5 w-3.5' },
  md: { button: 'h-9 w-9', icon: 'h-4 w-4' },
  lg: { button: 'h-10 w-10', icon: 'h-5 w-5' }
}

export function SkipButton({ direction, onSkip, disabled, size = 'md', className }: SkipButtonProps) {
  const s = sizes[size]
  const Icon = direction === 'back' ? SkipBack : SkipForward

  return (
    <Button variant='ghost' size='icon' className={cn(s.button, className)} onClick={onSkip} disabled={disabled}>
      <Icon className={s.icon} />
    </Button>
  )
}

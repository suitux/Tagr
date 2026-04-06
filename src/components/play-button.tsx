'use client'

import { Loader2, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PlayButtonProps {
  isPlaying: boolean
  isBuffering: boolean
  onToggle: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { button: 'h-7 w-7', icon: 'h-3.5 w-3.5', loader: 'h-8 w-8' },
  md: { button: 'h-9 w-9', icon: 'h-5 w-5', loader: 'h-10 w-10' },
  lg: { button: 'h-12 w-12', icon: 'h-6 w-6', loader: 'h-14 w-14' }
}

export function PlayButton({ isPlaying, isBuffering, onToggle, size = 'md', className }: PlayButtonProps) {
  const s = sizes[size]

  return (
    <Button variant='ghost' size='icon' className={cn('relative', s.button, className)} onClick={onToggle}>
      {isPlaying ? <Pause className={s.icon} /> : <Play className={s.icon} />}
      {isBuffering && <Loader2 className={cn('absolute animate-spin text-muted-foreground', s.loader)} />}
    </Button>
  )
}

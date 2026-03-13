import type { LucideIcon } from 'lucide-react'
import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PreviewCardActionButtonProps {
  tooltip: string
  tooltipSide?: ComponentProps<typeof TooltipContent>['side']
  icon: LucideIcon
  onClick?: (e: React.MouseEvent) => void
  fillIcon?: boolean
}

export function PreviewCardActionButton({
  tooltip,
  icon: Icon,
  onClick,
  fillIcon,
  tooltipSide = 'top'
}: PreviewCardActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='w-12 h-12 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20'
          onClick={onClick}>
          <Icon
            className={cn('text-white', {
              'fill-white': fillIcon
            })}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

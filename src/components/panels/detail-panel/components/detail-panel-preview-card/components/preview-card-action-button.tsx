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

interface PreviewCardMobileActionButtonProps {
  icon: LucideIcon
  onClick?: (e: React.MouseEvent) => void
  fillIcon?: boolean
  primary?: boolean
}

export function PreviewCardMobileActionButton({
  icon: Icon,
  onClick,
  fillIcon,
  primary
}: PreviewCardMobileActionButtonProps) {
  return (
    <Button
      variant={primary ? 'default' : 'secondary'}
      size='icon'
      className={cn('rounded-full active:scale-95', primary ? 'h-12 w-12 min-[400px]:h-16 min-[400px]:w-16 shadow-lg' : 'h-10 w-10 min-[400px]:h-14 min-[400px]:w-14 bg-muted/80')}
      onClick={onClick}>
      <Icon className={cn(primary ? '!h-5 !w-5 min-[400px]:!h-6 min-[400px]:!w-6' : '!h-4 !w-4 min-[400px]:!h-5 min-[400px]:!w-5', { 'fill-current': fillIcon })} />
    </Button>
  )
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

import { cn } from '@/lib/utils'

interface DetailPanelRowProps {
  icon: React.ReactNode
  label: string
  value: string
  isPath?: boolean
}

export function DetailPanelRow({ icon, label, value, isPath }: DetailPanelRowProps) {
  return (
    <div className='flex items-start gap-3 p-3'>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className={cn('text-sm font-medium text-foreground mt-0.5', isPath && 'break-all text-xs')}>{value}</p>
      </div>
    </div>
  )
}

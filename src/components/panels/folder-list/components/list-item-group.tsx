'use client'

import { ChevronRightIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ListItemGroupProps {
  icon: ReactNode
  label: string
  isExpanded: boolean
  onToggleExpand: () => void
  action?: ReactNode
  children: ReactNode
}

export function ListItemGroup({ icon, label, isExpanded, onToggleExpand, action, children }: ListItemGroupProps) {
  return (
    <div className='mb-2'>
      <div className='flex items-center gap-1 px-2 py-1'>
        <button
          type='button'
          onClick={onToggleExpand}
          className='flex items-center gap-2 flex-1 rounded-md px-1 py-1 hover:bg-accent/50 cursor-pointer'>
          <ChevronRightIcon
            className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')}
          />
          {icon}
          <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</span>
        </button>
        {action}
      </div>

      {isExpanded && <div className='space-y-1 mt-1'>{children}</div>}
    </div>
  )
}

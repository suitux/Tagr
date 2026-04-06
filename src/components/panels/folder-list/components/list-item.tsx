'use client'

import { ChevronRightIcon, FoldersIcon, MusicIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ListItemProps {
  isSelected?: boolean
  isExpanded?: boolean
  hasExpandButton?: boolean
  onToggleExpand?: () => void
  onClick?: () => void
  icon: ReactNode
  label: string
  fileCount?: number
  subfolderCount?: number
  depth?: number
  className?: string
}

export function ListItem({
  isSelected,
  isExpanded,
  hasExpandButton,
  onToggleExpand,
  onClick,
  icon,
  label,
  fileCount,
  subfolderCount,
  depth = 0,
  className
}: ListItemProps) {
  const t = useTranslations('folders')

  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      onClick={onClick}
      className={cn(
        'w-full justify-start gap-2 h-auto px-3 py-2.5 cursor-pointer',
        isSelected && 'bg-accent shadow-sm',
        className
      )}
      style={depth > 0 ? { paddingLeft: `${12 + depth * 16}px` } : undefined}>
      {hasExpandButton ? (
        <span
          onClick={e => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className='flex items-center justify-center w-5 h-5 rounded hover:bg-muted-foreground/20 transition-colors'>
          <ChevronRightIcon
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
        </span>
      ) : (
        <div className='w-5 h-5' />
      )}

      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}>
        {icon}
      </div>

      <div className='flex-1 min-w-0 text-left'>
        <p className={cn('text-sm font-medium truncate', isSelected ? 'text-foreground' : 'text-foreground/80')}>
          {label}
        </p>
        {(fileCount != null || (subfolderCount != null && subfolderCount > 0)) && (
          <div className='flex items-center gap-3 mt-0.5'>
            {fileCount != null && (
              <div className='flex items-center gap-1.5'>
                <MusicIcon className='w-3 h-3 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {fileCount} {t('file', { count: fileCount })}
                </span>
              </div>
            )}
            {subfolderCount != null && subfolderCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <FoldersIcon className='w-3 h-3 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {subfolderCount} {t('subfolder', { count: subfolderCount })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isSelected && <div className='w-1.5 h-8 bg-primary rounded-full' />}
    </Button>
  )
}

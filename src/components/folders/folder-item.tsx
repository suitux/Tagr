'use client'

import { FolderIcon, FolderOpenIcon, AlertCircleIcon, MusicIcon } from 'lucide-react'
import type { FolderContent } from '@/features/folders/hooks/use-folders'
import { cn } from '@/lib/utils'

interface FolderItemProps {
  folder: FolderContent
  isSelected?: boolean
  onClick?: () => void
}

export function FolderItem({ folder, isSelected, onClick }: FolderItemProps) {
  const folderName = folder.folder.split('/').pop() || folder.folder
  const hasError = !!folder.error
  const fileCount = folder.files.length

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
        'hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected && 'bg-accent text-accent-foreground shadow-sm',
        hasError && 'opacity-70'
      )}>
      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}>
        {hasError ? (
          <AlertCircleIcon className='w-5 h-5 text-destructive' />
        ) : isSelected ? (
          <FolderOpenIcon className='w-5 h-5' />
        ) : (
          <FolderIcon className='w-5 h-5' />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <p className={cn('text-sm font-medium truncate', isSelected ? 'text-foreground' : 'text-foreground/80')}>
          {folderName}
        </p>
        <div className='flex items-center gap-1.5 mt-0.5'>
          <MusicIcon className='w-3 h-3 text-muted-foreground' />
          <span className='text-xs text-muted-foreground'>
            {fileCount} {fileCount === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>
      </div>

      {isSelected && <div className='w-1.5 h-8 bg-primary rounded-full' />}
    </button>
  )
}

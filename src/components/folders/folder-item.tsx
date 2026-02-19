'use client'

import { FolderIcon, FolderOpenIcon, AlertCircleIcon, MusicIcon, FoldersIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FolderContent } from '@/features/folders/domain'
import { cn } from '@/lib/utils'

interface FolderItemProps {
  folder: FolderContent
  isSelected?: boolean
  onClick?: () => void
}

export function FolderItem({ folder, isSelected, onClick }: FolderItemProps) {
  const t = useTranslations('folders')
  const folderName = folder.folder.split('/').pop() || folder.folder
  const hasError = !!folder.error
  const fileCount = folder.totalFiles
  const subfolderCount = folder.totalSubfolders

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isSelected ? 'secondary' : 'ghost'}
          onClick={onClick}
          className={cn(
            'w-full justify-start gap-3 h-auto px-3 py-2.5 cursor-pointer',
            isSelected && 'bg-accent shadow-sm',
            hasError && 'opacity-70'
          )}>
          <div
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
            {hasError ? (
              <AlertCircleIcon className='w-5 h-5 text-destructive' />
            ) : isSelected ? (
              <FolderOpenIcon className='w-5 h-5' />
            ) : (
              <FolderIcon className='w-5 h-5' />
            )}
          </div>

          <div className='flex-1 min-w-0 text-left'>
            <p className={cn('text-sm font-medium truncate', isSelected ? 'text-foreground' : 'text-foreground/80')}>
              {folderName}
            </p>
            <div className='flex items-center gap-3 mt-0.5'>
              <div className='flex items-center gap-1.5'>
                <MusicIcon className='w-3 h-3 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {fileCount} {t('file', { count: fileCount })}
                </span>
              </div>
              {subfolderCount > 0 && (
                <div className='flex items-center gap-1.5'>
                  <FoldersIcon className='w-3 h-3 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>
                    {subfolderCount} {t('subfolder', { count: subfolderCount })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isSelected && <div className='w-1.5 h-8 bg-primary rounded-full' />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='right' className='max-w-xs'>
        <p className='text-xs break-all'>{folder.folder}</p>
      </TooltipContent>
    </Tooltip>
  )
}

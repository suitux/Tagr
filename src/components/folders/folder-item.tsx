'use client'

import {
  FolderIcon,
  FolderOpenIcon,
  AlertCircleIcon,
  MusicIcon,
  FoldersIcon,
  ChevronRightIcon,
  Loader2Icon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FolderContent, Subfolder } from '@/features/folders/domain'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { cn } from '@/lib/utils'

interface FolderItemProps {
  folder: FolderContent
  isSelected?: boolean
  onFolderSelect?: (folderId: string | null) => void
  selectedFolderId?: string | null
  depth?: number
}

export function FolderItem({ folder, isSelected, onFolderSelect, selectedFolderId, depth = 0 }: FolderItemProps) {
  const t = useTranslations('folders')
  const [isExpanded, setIsExpanded] = useState(false)
  const folderName = folder.folder.split('/').pop() || folder.folder
  const hasError = !!folder.error
  const fileCount = folder.totalFiles
  const subfolderCount = folder.totalSubfolders
  const hasSubfolders = subfolderCount > 0

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSelected ? 'secondary' : 'ghost'}
            onClick={() => onFolderSelect?.(folder.folder)}
            className={cn(
              'w-full justify-start gap-2 h-auto px-3 py-2.5 cursor-pointer',
              isSelected && 'bg-accent shadow-sm',
              hasError && 'opacity-70'
            )}
            style={{ paddingLeft: `${12 + depth * 16}px` }}>
            {/* Expand/Collapse Button */}
            {hasSubfolders ? (
              <button
                onClick={handleExpandClick}
                className='flex items-center justify-center w-5 h-5 rounded hover:bg-muted-foreground/20 transition-colors'>
                <ChevronRightIcon
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>
            ) : (
              <div className='w-5 h-5' />
            )}

            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
              {hasError ? (
                <AlertCircleIcon className='w-5 h-5 text-destructive' />
              ) : isExpanded || isSelected ? (
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

      {/* Subfolders */}
      {isExpanded && hasSubfolders && (
        <div className='relative'>
          <div
            className='absolute left-0 top-0 bottom-0 w-px bg-border'
            style={{ marginLeft: `${20 + depth * 16}px` }}
          />
          {folder.subfolders.map(subfolder => (
            <SubfolderItem
              key={subfolder.path}
              subfolder={subfolder}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SubfolderItemProps {
  subfolder: Subfolder
  depth: number
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
}

function SubfolderItem({ subfolder, depth, selectedFolderId, onFolderSelect }: SubfolderItemProps) {
  const { data, isLoading } = useFolders(subfolder.path)

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 px-3 py-2' style={{ paddingLeft: `${12 + depth * 16}px` }}>
        <div className='w-5 h-5' />
        <Loader2Icon className='w-4 h-4 animate-spin text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>{subfolder.name}</span>
      </div>
    )
  }

  const folderContent = data?.folders[0]

  if (!folderContent) {
    return null
  }

  return (
    <FolderItem
      folder={folderContent}
      depth={depth}
      isSelected={selectedFolderId === folderContent.folder}
      selectedFolderId={selectedFolderId}
      onFolderSelect={onFolderSelect}
    />
  )
}

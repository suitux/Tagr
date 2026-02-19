'use client'

import { MusicIcon, PlayCircleIcon, ClockIcon, FileAudioIcon, FolderOpenIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFolders } from '@/features/folders/hooks/use-folders'
import { MusicFile } from '@/features/music-files/domain'
import { cn } from '@/lib/utils'

interface MainContentProps {
  selectedFolderId?: string | null
  onFileSelect?: (file: MusicFile | null) => void
  selectedFile?: MusicFile | null
}

export function MainContent({ selectedFolderId, onFileSelect, selectedFile }: MainContentProps) {
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')
  const { data } = useFolders()

  const selectedFolder = data?.folders.find(f => f.folder === selectedFolderId)

  if (!selectedFolderId || !selectedFolder) {
    return (
      <div className='flex flex-col h-full items-center justify-center text-center p-8'>
        <Card className='max-w-sm w-full'>
          <CardHeader className='text-center'>
            <div className='mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4'>
              <FolderOpenIcon className='w-10 h-10 text-muted-foreground/50' />
            </div>
            <CardTitle>{tFolders('selectFolder')}</CardTitle>
            <CardDescription>{tFolders('selectFolderDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const folderName = selectedFolder.folder.split('/').pop() || selectedFolder.folder

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 px-6 py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{folderName}</h1>
            <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{selectedFolder.folder}</p>
          </div>
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: selectedFolder.files.length })}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* File List */}
      <ScrollArea className='flex-1'>
        {selectedFolder.files.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8'>
            <Card className='max-w-sm'>
              <CardContent className='pt-6'>
                <div className='mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
                  <FileAudioIcon className='w-8 h-8 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground'>{tFiles('empty')}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className='p-4'>
            {/* Table Header */}
            <div className='grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              <span>{tCommon('name')}</span>
              <span className='text-right'>{tCommon('size')}</span>
              <span className='text-right'>{tCommon('modified')}</span>
            </div>

            <Separator className='mb-2' />

            {/* File Items */}
            <div className='space-y-1'>
              {selectedFolder.files.map(file => (
                <FileItem
                  key={file.path}
                  file={file}
                  isSelected={selectedFile?.path === file.path}
                  onClick={() => onFileSelect?.(file)}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

interface FileItemProps {
  file: MusicFile
  isSelected?: boolean
  onClick?: () => void
}

function FileItem({ file, isSelected, onClick }: FileItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExtensionVariant = (ext: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      '.mp3': 'default',
      '.flac': 'secondary',
      '.wav': 'outline',
      '.m4a': 'default',
      '.ogg': 'destructive',
      '.aac': 'secondary'
    }
    return variants[ext] || 'outline'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isSelected ? 'secondary' : 'ghost'}
          onClick={onClick}
          className={cn(
            'w-full h-auto py-3 px-4 grid grid-cols-[1fr_100px_120px] gap-4 items-center cursor-pointer',
            isSelected && 'bg-accent shadow-sm'
          )}>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='relative flex-shrink-0'>
              <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
                <MusicIcon className='w-5 h-5 text-muted-foreground' />
              </div>
              {isSelected && <PlayCircleIcon className='absolute -bottom-1 -right-1 w-5 h-5 text-primary' />}
            </div>
            <div className='min-w-0 flex-1 text-left'>
              <p className='text-sm font-medium text-foreground truncate'>{file.name}</p>
              <Badge variant={getExtensionVariant(file.extension)} className='mt-0.5 text-[10px] h-4'>
                {file.extension.replace('.', '').toUpperCase()}
              </Badge>
            </div>
          </div>

          <span className='text-sm text-muted-foreground text-right'>{formatFileSize(file.size)}</span>

          <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
            <ClockIcon className='w-3.5 h-3.5' />
            <span>{formatDate(file.modifiedAt)}</span>
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className='text-xs'>{file.path}</p>
      </TooltipContent>
    </Tooltip>
  )
}

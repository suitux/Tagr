'use client'

import { ClockIcon, FileAudioIcon, FolderOpenIcon, Loader2Icon, MusicIcon, PlayCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Song } from '@/features/songs/domain'
import { useSongsByFolder } from '@/features/songs/hooks/use-songs-by-folder'
import { cn } from '@/lib/utils'

interface MainContentProps {
  selectedFolderId?: string | null
  onFileSelect?: (file: Song | null) => void
  selectedFile?: Song | null
}

export function MainContent({ selectedFolderId, onFileSelect, selectedFile }: MainContentProps) {
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')
  const tCommon = useTranslations('common')
  const { data, isLoading } = useSongsByFolder(selectedFolderId ?? undefined)

  if (!selectedFolderId) {
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

  if (isLoading) {
    return (
      <div className='flex flex-col h-full items-center justify-center'>
        <Loader2Icon className='w-8 h-8 animate-spin text-muted-foreground' />
        <p className='text-sm text-muted-foreground mt-2'>{tFolders('loadingFolders')}</p>
      </div>
    )
  }

  const songs = data?.success ? data.files : []
  const folderName = selectedFolderId.split('/').pop() || selectedFolderId

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 px-6 py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{folderName}</h1>
            <p className='text-sm text-muted-foreground mt-1 truncate max-w-lg'>{selectedFolderId}</p>
          </div>
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: songs.length })}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* File List */}
      {songs.length === 0 ? (
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
        <div className='pt-4 px-4 flex flex-col overflow-auto'>
          {/* Table Header */}
          <div className='grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            <span>{tCommon('name')}</span>
            <span className='text-right'>{tCommon('size')}</span>
            <span className='text-right'>{tCommon('modified')}</span>
          </div>

          <Separator className='mb-2' />

          {/* File Items */}
          <ScrollArea className='flex-1 overflow-auto'>
            {songs.map(song => (
              <FileItem
                key={song.filePath}
                song={song}
                isSelected={selectedFile?.filePath === song.filePath}
                onClick={() => onFileSelect?.(song)}
              />
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

interface FileItemProps {
  song: Song
  isSelected?: boolean
  onClick?: () => void
}

function FileItem({ song, isSelected, onClick }: FileItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExtensionVariant = (ext: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      mp3: 'default',
      flac: 'secondary',
      wav: 'outline',
      m4a: 'default',
      ogg: 'destructive',
      aac: 'secondary'
    }
    return variants[ext.toLowerCase()] || 'outline'
  }

  const displayName = song.title || song.fileName

  return (
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
          <p className='text-sm font-medium text-foreground truncate'>{displayName}</p>
          <div className='flex items-center gap-2 mt-0.5'>
            <Badge variant={getExtensionVariant(song.extension)} className='text-[10px] h-4'>
              {song.extension.toUpperCase()}
            </Badge>
            {song.artist && <span className='text-xs text-muted-foreground truncate'>{song.artist}</span>}
          </div>
        </div>
      </div>

      <span className='text-sm text-muted-foreground text-right'>{formatFileSize(song.fileSize)}</span>

      <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
        <ClockIcon className='w-3.5 h-3.5' />
        <span>{formatDate(song.modifiedAt)}</span>
      </div>
    </Button>
  )
}

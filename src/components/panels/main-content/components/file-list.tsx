'use client'

import { useTranslations } from 'next-intl'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Song } from '@/features/songs/domain'
import { FileItem } from './file-item'

interface FileListProps {
  songs: Song[]
  selectedFile?: Song | null
  onFileSelect?: (file: Song | null) => void
}

export function FileList({ songs, selectedFile, onFileSelect }: FileListProps) {
  const tCommon = useTranslations('common')

  return (
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
  )
}

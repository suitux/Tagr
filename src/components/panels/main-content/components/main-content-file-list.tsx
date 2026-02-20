'use client'

import { useTranslations } from 'next-intl'
import { MainContentEmptyFilesState } from '@/components/panels/main-content/components/main-content-empty-files-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useHome } from '@/contexts/home-context'
import { MainContentFileItem } from './main-content-file-item'

export function MainContentFileList() {
  const tCommon = useTranslations('common')
  const { selectedSongId, songs, setSelectedSongId, isLoadingSongs } = useHome()

  if (songs.length === 0 && !isLoadingSongs) {
    return <MainContentEmptyFilesState />
  }

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
          <MainContentFileItem
            key={song.filePath}
            song={song}
            isSelected={selectedSongId === song.id}
            onClick={() => setSelectedSongId?.(song.id)}
          />
        ))}
      </ScrollArea>
    </div>
  )
}

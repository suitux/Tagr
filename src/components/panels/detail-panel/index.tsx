'use client'

import { useTranslations } from 'next-intl'
import { AudioPropertiesSection } from '@/components/panels/detail-panel/components/audio-properties-section'
import { DetailHeader } from '@/components/panels/detail-panel/components/detail-header'
import { EmptyState } from '@/components/panels/detail-panel/components/empty-state'
import { FileDetailsSection } from '@/components/panels/detail-panel/components/file-details-section'
import { MusicInfoSection } from '@/components/panels/detail-panel/components/music-info-section'
import { NotesSection } from '@/components/panels/detail-panel/components/notes-section'
import { PreviewCard } from '@/components/panels/detail-panel/components/preview-card'
import { TrackInfoSection } from '@/components/panels/detail-panel/components/track-info-section'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Song } from '@/features/songs/domain'
import { useSongPicture } from '@/features/songs/hooks/use-song-picture'
import { getExtensionColor, getExtensionKey } from './utils'

interface DetailPanelProps {
  song?: Song | null
}

export function DetailPanel({ song }: DetailPanelProps) {
  const tFormats = useTranslations('formats')
  const { pictureUrl, hasPicture } = useSongPicture(song?.id)

  if (!song) {
    return <EmptyState />
  }

  const extKey = getExtensionKey(song.extension)
  const extColor = getExtensionColor(song.extension)
  const extName = tFormats(extKey)
  const displayTitle = song.title || song.fileName

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <DetailHeader
        title={displayTitle}
        subtitle={song.artist || extName}
        pictureUrl={pictureUrl}
        hasPicture={hasPicture}
        extColor={extColor}
      />

      <Separator />

      <ScrollArea className='flex-1 min-h-0'>
        <div className='p-4 space-y-6'>
          <PreviewCard
            title={displayTitle}
            extension={song.extension}
            lossless={song.lossless}
            pictureUrl={pictureUrl}
            hasPicture={hasPicture}
            extColor={extColor}
          />

          <MusicInfoSection song={song} />
          <TrackInfoSection song={song} />
          <AudioPropertiesSection song={song} extName={extName} />
          <FileDetailsSection song={song} />
          <NotesSection song={song} />
        </div>
      </ScrollArea>
    </div>
  )
}

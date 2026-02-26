'use client'

import { HistoryIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { HistoryModal } from '@/components/history-modal/history-modal'
import DetailPanelLoadingState from '@/components/panels/detail-panel/components/detail-pane-loading'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHome } from '@/contexts/home-context'
import { useSong } from '@/features/songs/hooks/use-song'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { DetailPanelAudioPropertiesSection } from './components/detail-panel-audio-properties-section'
import { DetailPanelEmptyState } from './components/detail-panel-empty-state'
import { DetailPanelFileDetailsSection } from './components/detail-panel-file-details-section'
import { DetailPanelMusicInfoSection } from './components/detail-panel-music-info-section'
import { DetailPanelNotesSection } from './components/detail-panel-notes-section'
import { DetailPanelPreviewCard } from './components/detail-panel-preview-card'
import { DetailPanelStatsSection } from './components/detail-panel-stats-section'
import { DetailPanelTrackInfoSection } from './components/detail-panel-track-info-section'
import { getExtensionColor, getExtensionKey } from './utils'

interface DetailPanelProps {
  songId?: number
}

export function DetailPanel({ songId }: DetailPanelProps) {
  const tHistory = useTranslations('history')
  const tFormats = useTranslations('formats')
  const { setSelectedSongId } = useHome()
  const { data: song, isLoading } = useSong(songId)
  const [historyOpen, setHistoryOpen] = useState(false)

  if (!songId) {
    return <DetailPanelEmptyState />
  }

  if (isLoading) {
    return <DetailPanelLoadingState />
  }

  if (!song) {
    return <DetailPanelEmptyState />
  }

  const pictureUrl = getSongPictureUrl(song?.id)
  const extKey = getExtensionKey(song.extension)
  const extColor = getExtensionColor(song.extension)
  const extName = tFormats(extKey)
  const displayTitle = song.title || song.fileName

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div className='flex justify-end gap-1 p-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setHistoryOpen(true)}>
              <HistoryIcon className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tHistory('viewHistory')}</TooltipContent>
        </Tooltip>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSelectedSongId(null)}>
          <XIcon className='h-4 w-4' />
        </Button>
      </div>
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-4 pb-4 space-y-6'>
          <DetailPanelPreviewCard
            songId={song.id}
            title={displayTitle}
            extension={song.extension}
            lossless={song.lossless}
            pictureUrl={pictureUrl}
            extColor={extColor}
          />

          <DetailPanelMusicInfoSection song={song} />
          <DetailPanelNotesSection song={song} />
          <DetailPanelTrackInfoSection song={song} />
          <DetailPanelAudioPropertiesSection song={song} extName={extName} />
          <DetailPanelStatsSection song={song} />
          <DetailPanelFileDetailsSection song={song} />
        </div>
      </ScrollArea>
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} songId={song.id} songTitle={displayTitle} />
    </div>
  )
}

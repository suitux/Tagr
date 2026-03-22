'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MusicBrainzLookupModal } from '@/components/musicbrainz-lookup-modal/musicbrainz-lookup-modal'
import { ShareDialog } from '@/components/share-dialog/share-dialog'
import DetailPanelLoadingState from '@/components/panels/detail-panel/components/detail-pane-loading'
import { DetailPanelFetchingOverlay } from '@/components/panels/detail-panel/components/detail-panel-fetching-overlay'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDownloadCover } from '@/features/songs/hooks/use-download-cover'
import { useSong } from '@/features/songs/hooks/use-song'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { DetailPanelToolbar } from './components/detail-panel-toolbar'
import { DetailPanelCustomMetadataSection } from './components/detail-panel-custom-metadata-section/detail-panel-custom-metadata-section'
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
  const tFormats = useTranslations('formats')
  const { data: song, isPending, isFetching } = useSong(songId)
  const downloadCover = useDownloadCover(song)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [musicBrainzLookupOpen, setMusicBrainzLookupOpen] = useState(false)

  if (!songId) {
    return <DetailPanelEmptyState />
  }

  if (isPending) {
    return <DetailPanelLoadingState />
  }

  if (!song) {
    return <DetailPanelEmptyState />
  }

  const pictureUrl = getSongPictureUrl(song.id, song.modifiedAt)
  const extKey = getExtensionKey(song.extension)
  const extColor = getExtensionColor(song.extension)
  const extName = tFormats(extKey)
  const displayTitle = song.title || song.fileName

  return (
    <div className='relative flex flex-col h-full overflow-hidden'>
      {isFetching && <DetailPanelFetchingOverlay />}
      <DetailPanelToolbar
        song={song}
        displayTitle={displayTitle}
        onShare={() => setShareOpen(true)}
        onMusicBrainzLookup={() => setMusicBrainzLookupOpen(true)}
        onDownloadCover={downloadCover}
        onEditCover={() => fileInputRef.current?.click()}
      />
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-4 pb-4 space-y-6'>
          <DetailPanelPreviewCard song={song} title={displayTitle} pictureUrl={pictureUrl} extColor={extColor} onShare={() => setShareOpen(true)} onMusicBrainzLookup={() => setMusicBrainzLookupOpen(true)} fileInputRef={fileInputRef} />
          <DetailPanelMusicInfoSection song={song} />
          <DetailPanelNotesSection song={song} />
          <DetailPanelCustomMetadataSection songId={song.id} metadata={song.metadata ?? []} />
          <DetailPanelTrackInfoSection song={song} />
          <DetailPanelAudioPropertiesSection song={song} extName={extName} />
          <DetailPanelStatsSection song={song} />
          <DetailPanelFileDetailsSection song={song} />
        </div>
      </ScrollArea>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} songId={song.id} songTitle={displayTitle} />
      <MusicBrainzLookupModal open={musicBrainzLookupOpen} onOpenChange={setMusicBrainzLookupOpen} song={song} />
    </div>
  )
}

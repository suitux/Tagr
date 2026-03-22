'use client'

import { HistoryIcon, Share2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { HistoryModal } from '@/components/history-modal/history-modal'
import { MusicBrainzLookupModal } from '@/components/musicbrainz-lookup-modal/musicbrainz-lookup-modal'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Song } from '@/features/songs/domain'
import { useSelectedSong } from '@/hooks/use-selected-song'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { RescanSongIconButton } from './rescan-song-icon-button'

interface DetailPanelToolbarProps {
  song: Song
  displayTitle: string
  onShare: () => void
}

export function DetailPanelToolbar({ song, displayTitle, onShare }: DetailPanelToolbarProps) {
  const tHistory = useTranslations('history')
  const tMusicBrainz = useTranslations('musicbrainzLookup')
  const tShare = useTranslations('share')
  const { setSelectedSongId } = useSelectedSong()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [musicBrainzLookupOpen, setMusicBrainzLookupOpen] = useState(false)

  return (
    <>
      <div className='flex justify-end gap-1 p-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' onClick={onShare}>
              <Share2Icon className='h-5 w-5 md:h-4 md:w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tShare('tooltip')}</TooltipContent>
        </Tooltip>
        <RescanSongIconButton songId={song.id} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' onClick={() => setMusicBrainzLookupOpen(true)}>
              <MusicBrainzIcon className='h-5 w-5 md:h-4 md:w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tMusicBrainz('tooltip')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' onClick={() => setHistoryOpen(true)}>
              <HistoryIcon className='h-5 w-5 md:h-4 md:w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tHistory('viewHistory')}</TooltipContent>
        </Tooltip>
        <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' onClick={() => setSelectedSongId(null)}>
          <XIcon className='h-5 w-5 md:h-4 md:w-4' />
        </Button>
      </div>
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} songId={song.id} songTitle={displayTitle} />
      <MusicBrainzLookupModal open={musicBrainzLookupOpen} onOpenChange={setMusicBrainzLookupOpen} song={song} />
    </>
  )
}

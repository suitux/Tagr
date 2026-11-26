'use client'

import {
  EllipsisVerticalIcon,
  HistoryIcon,
  ImageDownIcon,
  ImageUpIcon,
  RefreshCwIcon,
  Share2Icon,
  EyeDashedIcon,
  XIcon
} from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { HistoryModal } from '@/components/history-modal/history-modal'
import { SettingsModal } from '@/components/settings-modal/settings-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Song } from '@/features/songs/domain'
import { useCanEditSong, useIsSongReadOnly } from '@/features/songs/hooks/use-can-edit-song'
import { useRescanSong } from '@/features/songs/hooks/use-rescan-song'
import { useSelectedSong } from '@/hooks/use-selected-song'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'

interface DetailPanelToolbarProps {
  song: Song
  displayTitle: string
  onShare: () => void
  onMusicBrainzLookup: () => void
  onDownloadCover: () => void
  onEditCover: () => void
}

export function DetailPanelToolbar({ song, displayTitle, onShare, onMusicBrainzLookup, onDownloadCover, onEditCover }: DetailPanelToolbarProps) {
  const tHistory = useTranslations('history')
  const tMusicBrainz = useTranslations('musicbrainzLookup')
  const tShare = useTranslations('share')
  const tPreviewCard = useTranslations('previewCard')
  const tDetailPanelSettings = useTranslations('detailPanelSettings')
  const { setSelectedSongId } = useSelectedSong()
  const { mutate: rescanSong, isPending: isRescanning } = useRescanSong()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const canEdit = useCanEditSong()
  // A trashed song has nothing to share: its link would not resolve.
  const canShare = !useIsSongReadOnly()

  return (
    <>
      <div className='flex items-center p-2'>
        {/* Close button - left side */}
        <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' onClick={() => setSelectedSongId(null)}>
          <XIcon className='h-5 w-5 md:h-4 md:w-4' />
        </Button>

        <div className='flex-1' />

        {/* Desktop buttons */}
        <div className='hidden md:flex gap-1'>
          {canShare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onShare}>
                  <Share2Icon className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tShare('tooltip')}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setSettingsOpen(true)}>
                <EyeDashedIcon className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tDetailPanelSettings('tooltip')}</TooltipContent>
          </Tooltip>
          {canEdit && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7' disabled={isRescanning} onClick={() => rescanSong(song.id)}>
                    <RefreshCwIcon className={`h-4 w-4 ${isRescanning ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tHistory('rescanSong')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onMusicBrainzLookup}>
                    <MusicBrainzIcon className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tMusicBrainz('tooltip')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setHistoryOpen(true)}>
                    <HistoryIcon className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tHistory('viewHistory')}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Mobile dropdown */}
        <div className='md:hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-9 w-9'>
                <EllipsisVerticalIcon className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onDownloadCover}>
                <ImageDownIcon />
                {tPreviewCard('downloadCover')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <EyeDashedIcon />
                {tDetailPanelSettings('tooltip')}
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={onEditCover}>
                    <ImageUpIcon />
                    {tPreviewCard('editCover')}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isRescanning} onClick={() => rescanSong(song.id)}>
                    <RefreshCwIcon className={isRescanning ? 'animate-spin' : ''} />
                    {tHistory('rescanSong')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                    <HistoryIcon />
                    {tHistory('viewHistory')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} songId={song.id} songTitle={displayTitle} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} section='detailPanel' />
    </>
  )
}

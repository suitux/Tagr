'use client'

import { ImageDownIcon, ImageUpIcon, LoaderCircleIcon, MusicIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import LosslessBadge from '@/components/lossless-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { useFetchMusicBrainzCover } from '@/features/musicbrainz/hooks/use-fetch-musicbrainz-cover'
import type { Song } from '@/features/songs/domain'
import { useUpdateSongPicture } from '@/features/songs/hooks/use-update-song-picture'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import MusicBrainzIcon from '@/icons/musicbrainz.svg'
import { cn } from '@/lib/utils'
import { useHomeStore } from '@/stores/home-store'
import { usePlayerStore } from '@/stores/player-store'
import { PreviewCardActionButton, PreviewCardMobileActionButton } from './components/preview-card-action-button'

interface DetailPanelPreviewCardProps {
  song: Song
  title: string
  pictureUrl: string
  extColor: string
}

export function DetailPanelPreviewCard({ song, title, pictureUrl, extColor }: DetailPanelPreviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: updatePicture, isPending } = useUpdateSongPicture()
  const { mutate: fetchMbCover, isPending: isFetchingCover } = useFetchMusicBrainzCover({
    onSuccess: () => {
      toast.success(tMb('fetchSuccess'))
    },
    onError: error => {
      toast.error(tMb('fetchError'), { description: error.message })
    }
  })
  const { selectedFolderId } = useSelectedFolder()
  const search = useHomeStore(s => s.search)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)
  const currentSong = usePlayerStore(s => s.currentSong)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const play = usePlayerStore(s => s.play)
  const t = useTranslations('previewCard')
  const tCommon = useTranslations('common')
  const tMb = useTranslations('musicbrainz')
  const { confirm } = useAlertDialog()
  const isCurrent = currentSong?.id === song.id

  const isUploading = isPending || isFetchingCover

  function handleImageEdit() {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  function handlePlayPause(e: React.MouseEvent) {
    e.stopPropagation()
    if (isCurrent) {
      togglePlayPause()
    } else {
      play(song, { folder: selectedFolderId, search, sorting, columnFilters })
    }
  }

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = pictureUrl
    link.download = `${song.artist ?? tCommon('unknown')} - ${song.album ?? tCommon('unknown')}.jpg`
    link.click()
  }

  function handleFetchCover(e: React.MouseEvent) {
    e.stopPropagation()
    if (isUploading) return

    confirm({
      title: tMb('fetchMusicBrainzConfirmTitle'),
      description: tMb('fetchMusicBrainzConfirmDescription'),
      icon: <MusicBrainzIcon className='h-5 w-5 shrink-0' />,
      cancel: { label: tCommon('cancel') },
      action: {
        label: tMb('fetchMusicBrainzConfirmAction'),
        onClick: () => fetchMbCover(song.id)
      }
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    updatePicture({ songId: song.id, file })

    e.target.value = ''
  }

  return (
    <Card className='p-0'>
      <CardContent className='p-0'>
        <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
          <div className='absolute inset-0 bg-grid-pattern opacity-5' />
          <div className='relative flex flex-col items-center py-6 px-4'>
            <div className='w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-4 relative group'>
              <Image
                src={pictureUrl}
                alt={title}
                fill
                className='object-cover'
                unoptimized
                fallbackComponent={
                  <div
                    className={cn(
                      'w-64 h-64 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-2xl mb-4',
                      extColor
                    )}>
                    <MusicIcon className='w-32 h-32 text-white' />
                  </div>
                }
              />
              {isUploading && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl'>
                  <LoaderCircleIcon className='w-10 h-10 text-white animate-spin' />
                </div>
              )}
              {!isUploading && (
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-2xl hidden md:flex items-center justify-center gap-3'>
                  <div className={'grid grid-cols-2 gap-4'}>
                    <PreviewCardActionButton
                      tooltip={isCurrent && isPlaying ? t('pause') : t('play')}
                      icon={isCurrent && isPlaying ? PauseIcon : PlayIcon}
                      onClick={handlePlayPause}
                      fillIcon
                    />
                    <PreviewCardActionButton tooltip={t('editCover')} icon={ImageUpIcon} onClick={handleImageEdit} />
                    <PreviewCardActionButton
                      tooltip={t('downloadCover')}
                      icon={ImageDownIcon}
                      onClick={handleDownload}
                      tooltipSide={'bottom'}
                    />
                    <PreviewCardActionButton
                      tooltip={tMb('fetchMusicBrainz')}
                      icon={MusicBrainzIcon}
                      onClick={handleFetchCover}
                      tooltipSide={'bottom'}
                    />
                  </div>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

            {!isUploading && (
              <div className='flex md:hidden items-center justify-center gap-2 mt-3'>
                <PreviewCardMobileActionButton
                  icon={isCurrent && isPlaying ? PauseIcon : PlayIcon}
                  onClick={handlePlayPause}
                  fillIcon
                />
                <PreviewCardMobileActionButton icon={ImageUpIcon} onClick={handleImageEdit} />
                <PreviewCardMobileActionButton icon={ImageDownIcon} onClick={handleDownload} />
                <PreviewCardMobileActionButton icon={MusicBrainzIcon} onClick={handleFetchCover} />
              </div>
            )}

            <div className='flex items-center gap-2 mt-3'>
              <Badge variant='secondary'>{song.extension.toUpperCase()}</Badge>
              {song.lossless && <LosslessBadge />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

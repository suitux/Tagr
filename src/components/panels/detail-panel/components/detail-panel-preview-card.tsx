'use client'

import { LoaderCircleIcon, MusicIcon, PauseIcon, PencilIcon, PlayIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { useHome } from '@/contexts/home-context'
import type { Song } from '@/features/songs/domain'
import { useUpdateSongPicture } from '@/features/songs/hooks/use-update-song-picture'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface DetailPanelPreviewCardProps {
  song: Song
  title: string
  pictureUrl: string
  extColor: string
}

export function DetailPanelPreviewCard({
  song,
  title,
  pictureUrl,
  extColor
}: DetailPanelPreviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cacheBust, setCacheBust] = useState(0)
  const { mutate: updatePicture, isPending } = useUpdateSongPicture()
  const { selectedFolderId, search, sorting, columnFilters } = useHome()
  const currentSong = usePlayerStore(s => s.currentSong)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const play = usePlayerStore(s => s.play)
  const isCurrent = currentSong?.id === song.id

  const imageUrl = cacheBust ? `${pictureUrl}?t=${cacheBust}` : pictureUrl

  function handleImageClick() {
    if (!isPending) {
      fileInputRef.current?.click()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    updatePicture(
      { songId: song.id, file },
      {
        onSuccess: () => {
          setCacheBust(Date.now())
        }
      }
    )

    e.target.value = ''
  }

  return (
    <Card className='p-0'>
      <CardContent className='p-0'>
        <div className='relative bg-gradient-to-br from-muted/50 to-muted'>
          <div className='absolute inset-0 bg-grid-pattern opacity-5' />
          <div className='relative flex flex-col items-center py-6 px-4'>
            <div
              className='w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-4 relative cursor-pointer group'
              onClick={handleImageClick}>
              <Image
                src={imageUrl}
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
              {isPending && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl'>
                  <LoaderCircleIcon className='w-10 h-10 text-white animate-spin' />
                </div>
              )}
              {!isPending && (
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-2xl flex items-center justify-center gap-3'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='w-12 h-12 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20'
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isCurrent) {
                        togglePlayPause()
                      } else {
                        play(song, { folder: selectedFolderId, search, sorting, columnFilters })
                      }
                    }}>
                    {isCurrent && isPlaying ? (
                      <PauseIcon className='w-5 h-5 text-white fill-white' />
                    ) : (
                      <PlayIcon className='w-5 h-5 text-white fill-white' />
                    )}
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='w-12 h-12 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20'>
                    <PencilIcon className='w-5 h-5 text-white' />
                  </Button>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>{song.extension.toUpperCase()}</Badge>
              {song.lossless && <Badge variant='outline'>Lossless</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

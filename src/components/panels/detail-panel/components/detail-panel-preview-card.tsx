'use client'

import { LoaderCircleIcon, MusicIcon, PencilIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { useUpdateSongPicture } from '@/features/songs/hooks/use-update-song-picture'
import { cn } from '@/lib/utils'

interface DetailPanelPreviewCardProps {
  songId: number
  title: string
  extension: string
  lossless?: boolean
  pictureUrl: string
  extColor: string
}

export function DetailPanelPreviewCard({
  songId,
  title,
  extension,
  lossless,
  pictureUrl,
  extColor
}: DetailPanelPreviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cacheBust, setCacheBust] = useState(0)
  const { mutate: updatePicture, isPending } = useUpdateSongPicture()

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
      { songId, file },
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
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-2xl flex items-center justify-center'>
                  <div className='w-12 h-12 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <PencilIcon className='w-5 h-5 text-white' />
                  </div>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>{extension.toUpperCase()}</Badge>
              {lossless && <Badge variant='outline'>Lossless</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

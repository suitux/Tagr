'use client'

import { MusicIcon } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { cn } from '@/lib/utils'
import type { Song } from '@/features/songs/domain'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'

interface SidebarPlayerImageProps {
  song: Song
  expanded: boolean
  onSongTitleClick: () => void
}

export function SidebarPlayerImage({ song, expanded, onSongTitleClick }: SidebarPlayerImageProps) {
  const pictureUrl = getSongPictureUrl(song.id)

  return (
    <>
      <div className={cn('flex justify-center', !expanded && 'hidden')}>
        <div className='w-full max-w-64 aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center'>
          <Image
            src={pictureUrl}
            alt=''
            width={300}
            height={300}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-12 h-12 text-muted-foreground' />}
          />
        </div>
      </div>

      <div className={cn('text-center space-y-0.5', !expanded && 'hidden')}>
        <p
          className='text-sm font-medium truncate cursor-pointer hover:underline'
          onClick={onSongTitleClick}>
          {song.title || song.fileName}
        </p>
        {song.artist && <p className='text-xs text-muted-foreground truncate'>{song.artist}</p>}
        {song.album && <p className='text-xs text-muted-foreground/70 truncate'>{song.album}</p>}
      </div>
    </>
  )
}

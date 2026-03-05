'use client'

import { MusicIcon } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { useHome } from '@/contexts/home-context'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'

interface SidebarPlayerImageProps {
  expanded: boolean
}

export function SidebarPlayerImage({ expanded }: SidebarPlayerImageProps) {
  const currentSong = usePlayerStore(s => s.currentSong)
  const { setSelectedSongId } = useHome()

  if (!currentSong) return null

  const pictureUrl = getSongPictureUrl(currentSong.id)

  const handleSongTitleClick = () => {
    setSelectedSongId(currentSong.id)
  }

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
          onClick={handleSongTitleClick}>
          {currentSong.title || currentSong.fileName}
        </p>
        {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        {currentSong.album && <p className='text-xs text-muted-foreground/70 truncate'>{currentSong.album}</p>}
      </div>
    </>
  )
}

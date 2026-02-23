import { MusicIcon } from 'lucide-react'
import { getExtensionVariant } from '@/components/panels/main-content/utils'
import { Badge } from '@/components/ui/badge'
import type { Song } from '@/features/songs/domain'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'

function NameCell({ song }: { song: Song }) {
  const displayName = song.title || song.fileName
  const pictureUrl = getSongPictureUrl(song.id)

  return (
    <div className='flex items-center gap-3 min-w-0'>
      <div className='flex-shrink-0'>
        <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden'>
          <img
            src={pictureUrl}
            alt=''
            className='w-full h-full object-cover'
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <MusicIcon className='w-5 h-5 text-muted-foreground hidden' />
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-foreground truncate'>{displayName}</p>
        <div className='flex items-center gap-2 mt-0.5'>
          <Badge variant={getExtensionVariant(song.extension)} className='text-[10px] h-4'>
            {song.extension.toUpperCase()}
          </Badge>
          {song.artist && <span className='text-xs text-muted-foreground truncate'>{song.artist}</span>}
        </div>
      </div>
    </div>
  )
}

export default NameCell

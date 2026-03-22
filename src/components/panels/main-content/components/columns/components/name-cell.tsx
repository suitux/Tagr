import { AudioLines, MusicIcon, Pause, Play } from 'lucide-react'
import { getExtensionVariant } from '@/components/panels/main-content/utils'
import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { useSelectedFolder } from '@/hooks/use-selected-folder'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useHomeStore } from '@/stores/home-store'
import type { Song } from '@/features/songs/domain'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { useMobileNavStore } from '@/stores/mobile-nav-store'
import { usePlayerStore } from '@/stores/player-store'

const NameCell = function NameCell({ song }: { song: Song }) {
  const displayName = song.title || song.fileName
  const pictureUrl = getSongPictureUrl(song.id, song.modifiedAt)
  const { selectedFolderId } = useSelectedFolder()
  const { setSelectedSongId } = useSelectedSong()
  const search = useHomeStore(s => s.search)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)
  const setDetailSheetOpen = useMobileNavStore(s => s.setDetailSheetOpen)
  const currentSong = usePlayerStore(s => s.currentSong)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const play = usePlayerStore(s => s.play)
  const isCurrent = currentSong?.id === song.id

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSongId(song.id)
    setDetailSheetOpen(true)
    if (isCurrent) {
      togglePlayPause()
    } else {
      play(song, { folder: selectedFolderId, search, sorting, columnFilters })
    }
  }

  return (
    <div className='flex items-center gap-3 min-w-0'>
      <div className='flex-shrink-0'>
        <div className='relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden'>
          <Image
            src={pictureUrl}
            alt=''
            width={40}
            height={40}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-5 h-5 text-muted-foreground' />}
          />
          {isCurrent && isPlaying ? (
            <div
              className='absolute inset-0 bg-black/50 flex group-hover:hidden items-center justify-center rounded-lg'
              onClick={handlePlay}>
              <AudioLines className='w-5 h-5 text-white animate-pulse' />
            </div>
          ) : null}
          <div
            className='absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer rounded-lg'
            onClick={handlePlay}>
            {isCurrent && isPlaying ? (
              <Pause className='w-5 h-5 text-white fill-white' />
            ) : (
              <Play className='w-5 h-5 text-white fill-white' />
            )}
          </div>
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
          {displayName}
        </p>
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

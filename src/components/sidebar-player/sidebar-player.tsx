'use client'

import { ChevronDown, ChevronUp, MusicIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { useHome } from '@/contexts/home-context'
import { useMediaSession } from '@/features/player/hooks/use-media-session'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
import { getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player-store'
import { SidebarPlayerAudioPlayer } from './components/sidebar-player-audio-player'
import { SidebarPlayerImage } from './components/sidebar-player-image'

export function SidebarPlayer() {
  const { setSelectedSongId } = useHome()
  const [expanded, setExpanded] = useState(true)

  const {
    currentSong,
    playNext,
    playPrevious,
    togglePlayPause,
    currentTime,
    duration,
    seek,
    queueFolder,
    queueSearch,
    queueSorting,
    queueFilters,
    setAdjacentSongs,
    _previousSong,
    _nextSong,
    isPlaying
  } = usePlayerStore(s => s)

  const hasPrevious = _previousSong !== null
  const hasNext = _nextSong !== null

  useMediaSession({ currentSong, playPrevious, playNext, togglePlayPause })

  const { data } = useAdjacentSongs(currentSong?.id ?? null, queueFolder, queueSearch, queueSorting, queueFilters)

  useEffect(() => {
    setAdjacentSongs(data?.previous ?? null, data?.next ?? null)
  }, [data, setAdjacentSongs])

  if (!currentSong) return null
  const pictureUrl = getSongPictureUrl(currentSong.id)

  const handleSongTitleClick = () => {
    setSelectedSongId(currentSong.id)
  }

  return (
    <div className={cn('space-y-2', expanded ? 'p-4 space-y-3' : 'p-3')}>
      <div className={cn('flex items-center', expanded ? 'justify-end' : 'gap-3')}>
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center',
            expanded && 'hidden'
          )}>
          <Image
            src={pictureUrl}
            alt=''
            width={40}
            height={40}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-5 h-5 text-muted-foreground' />}
          />
        </div>

        <div className={cn('min-w-0 flex-1', expanded && 'hidden')}>
          <p className='text-sm font-medium truncate cursor-pointer hover:underline' onClick={handleSongTitleClick}>
            {currentSong.title || currentSong.fileName}
          </p>
          {currentSong.artist && <p className='text-xs text-muted-foreground truncate'>{currentSong.artist}</p>}
        </div>

        <Button
          variant='ghost'
          size='icon'
          className={cn('flex-shrink-0', expanded ? 'h-6 w-6' : 'h-7 w-7')}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-3.5 w-3.5' />}
        </Button>
      </div>

      <SidebarPlayerImage song={currentSong} expanded={expanded} onSongTitleClick={handleSongTitleClick} />

      <SidebarPlayerAudioPlayer
        songId={currentSong.id}
        expanded={expanded}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onTogglePlayPause={togglePlayPause}
        onPlayPrevious={playPrevious}
        onPlayNext={playNext}
        onSeek={seek}
      />
    </div>
  )
}

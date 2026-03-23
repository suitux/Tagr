'use client'

import { ChevronDown, MusicIcon, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import { Waveform } from '@/components/waveform/waveform'
import type { Song } from '@/features/songs/domain'
import { getSongAudioUrl, getSongPictureUrl } from '@/features/songs/song-file-helpers'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { useMobileNavStore } from '@/stores/mobile-nav-store'
import { usePlayerStore } from '@/stores/player-store'

interface ExpandedPlayerProps {
  song: Song
  expanded: boolean
  onCollapse: () => void
}

export function ExpandedPlayer({ song, expanded, onCollapse }: ExpandedPlayerProps) {
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause)
  const playPrevious = usePlayerStore(s => s.playPrevious)
  const playNext = usePlayerStore(s => s.playNext)
  const _previousSong = usePlayerStore(s => s._previousSong)
  const _nextSong = usePlayerStore(s => s._nextSong)
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const seek = usePlayerStore(s => s.seek)
  const { setSelectedSongId } = useSelectedSong()
  const setDetailSheetOpen = useMobileNavStore(s => s.setDetailSheetOpen)

  const pictureUrl = getSongPictureUrl(song.id, song.modifiedAt)

  const openDetail = () => {
    setSelectedSongId(song.id)
    setDetailSheetOpen(true)
    onCollapse()
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-14 z-40 border-t bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${expanded ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className='flex flex-col items-center px-6 py-5 gap-4'>
        <button type='button' className='self-end' onClick={onCollapse}>
          <ChevronDown className='h-5 w-5 text-muted-foreground' />
        </button>

        <div className='w-48 h-48 rounded-2xl overflow-hidden shadow-xl bg-muted flex items-center justify-center'>
          <Image
            src={pictureUrl}
            alt=''
            width={192}
            height={192}
            className='w-full h-full object-cover'
            unoptimized
            fallbackComponent={<MusicIcon className='w-16 h-16 text-muted-foreground' />}
          />
        </div>

        <button type='button' className='text-center min-w-0 w-full' onClick={openDetail}>
          <p className='text-base font-semibold truncate'>{song.title || song.fileName}</p>
          {song.artist && <p className='text-sm text-muted-foreground truncate'>{song.artist}</p>}
        </button>

        <div className='w-full px-2'>
          <Waveform showTime url={getSongAudioUrl(song.id)} currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='h-10 w-10' onClick={playPrevious} disabled={!_previousSong}>
            <SkipBack className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon' className='h-12 w-12' onClick={togglePlayPause}>
            {isPlaying ? <Pause className='h-6 w-6' /> : <Play className='h-6 w-6' />}
          </Button>
          <Button variant='ghost' size='icon' className='h-10 w-10' onClick={playNext} disabled={!_nextSong}>
            <SkipForward className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  )
}

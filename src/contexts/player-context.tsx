'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'
import { useHome } from '@/contexts/home-context'

interface PlayerContextValue {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  hasPrevious: boolean
  hasNext: boolean
  play: (song: Song) => void
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
  seek: (time: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [previousSong, setPreviousSong] = useState<Song | null>(null)
  const [nextSong, setNextSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Snapshot of the queue context at the moment play() was pressed
  const [queueFolder, setQueueFolder] = useState<string | null>(null)
  const [queueSearch, setQueueSearch] = useState<string | undefined>(undefined)
  const [queueSorting, setQueueSorting] = useState<SongsSortParams | undefined>(undefined)
  const [queueFilters, setQueueFilters] = useState<SongColumnFilters | undefined>(undefined)

  const { selectedFolderId, search, sorting, columnFilters } = useHome()

  const { data: adjacentData } = useAdjacentSongs(
    currentSong?.id ?? null,
    queueFolder,
    queueSearch,
    queueSorting,
    queueFilters
  )

  useEffect(() => {
    if (adjacentData) {
      setPreviousSong(adjacentData.previous)
      setNextSong(adjacentData.next)
    }
  }, [adjacentData])

  const play = useCallback((song: Song) => {
    setCurrentSong(song)

    // Snapshot current view state as the queue context
    setQueueFolder(selectedFolderId)
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v)
    setQueueSearch(search || undefined)
    setQueueSorting(sorting)
    setQueueFilters(activeFilters.length > 0 ? (Object.fromEntries(activeFilters) as SongColumnFilters) : undefined)

    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(song.id)
      audio.play()
    }
  }, [selectedFolderId, search, sorting, columnFilters])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [currentSong])

  const playNext = useCallback(() => {
    if (!nextSong) return

    setCurrentSong(nextSong)
    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(nextSong.id)
      audio.play()
    }
  }, [nextSong])

  const playPrevious = useCallback(() => {
    if (!previousSong) return

    setCurrentSong(previousSong)
    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(previousSong.id)
      audio.play()
    }
  }, [previousSong])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
  }, [])

  const hasPrevious = previousSong !== null
  const hasNext = nextSong !== null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => playNext()
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration || 0)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
    }
  }, [playNext])

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        hasPrevious,
        hasNext,
        play,
        togglePlayPause,
        playNext,
        playPrevious,
        seek
      }}>
      <audio ref={audioRef} preload='auto' />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}


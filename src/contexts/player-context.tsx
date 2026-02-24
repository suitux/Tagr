'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
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

  const { selectedFolderId, search, sorting, columnFilters } = useHome()

  const activeFilters = useMemo(() => {
    const entries = Object.entries(columnFilters).filter(([, v]) => v)
    return entries.length > 0 ? (Object.fromEntries(entries) as SongColumnFilters) : undefined
  }, [columnFilters])

  const { data: adjacentData } = useAdjacentSongs(
    currentSong?.id ?? null,
    selectedFolderId,
    search || undefined,
    sorting,
    activeFilters
  )

  useEffect(() => {
    if (adjacentData) {
      setPreviousSong(adjacentData.previous)
      setNextSong(adjacentData.next)
    }
  }, [adjacentData])

  const play = useCallback((song: Song) => {
    setCurrentSong(song)

    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(song.id)
      audio.play()
    }
  }, [])

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


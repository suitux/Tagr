'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Song } from '@/features/songs/domain'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

interface PlayerContextValue {
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  isPlaying: boolean
  play: (song: Song, queue: Song[]) => void
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback((song: Song, newQueue: Song[]) => {
    const index = newQueue.findIndex(s => s.id === song.id)
    setQueue(newQueue)
    setQueueIndex(index >= 0 ? index : 0)
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
    if (queue.length === 0) return
    const nextIndex = queueIndex + 1
    if (nextIndex >= queue.length) return

    const nextSong = queue[nextIndex]
    setQueueIndex(nextIndex)
    setCurrentSong(nextSong)

    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(nextSong.id)
      audio.play()
    }
  }, [queue, queueIndex])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    const prevIndex = queueIndex - 1
    if (prevIndex < 0) return

    const prevSong = queue[prevIndex]
    setQueueIndex(prevIndex)
    setCurrentSong(prevSong)

    const audio = audioRef.current
    if (audio) {
      audio.src = getSongAudioUrl(prevSong.id)
      audio.play()
    }
  }, [queue, queueIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => playNext()

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playNext])

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        queueIndex,
        isPlaying,
        play,
        togglePlayPause,
        playNext,
        playPrevious
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

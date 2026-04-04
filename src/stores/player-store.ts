import { create } from 'zustand'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

let audio: HTMLAudioElement | null = null
let preloadAudio: HTMLAudioElement | null = null

function getPreloadAudio(): HTMLAudioElement {
  if (!preloadAudio && typeof window !== 'undefined') {
    preloadAudio = new Audio()
    preloadAudio.preload = 'auto'
    preloadAudio.volume = 0
  }
  return preloadAudio!
}

function preloadNextSong(song: Song | null) {
  if (!song || typeof window === 'undefined') return
  const p = getPreloadAudio()
  const url = getSongAudioUrl(song.id)
  if (p.src !== url) {
    p.src = url
  }
}

let seekTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSeek(a: HTMLAudioElement, time: number) {
  if (seekTimeout) clearTimeout(seekTimeout)
  seekTimeout = setTimeout(() => {
    a.currentTime = time
    seekTimeout = null
  }, 150)
}

function safePlay(a: HTMLAudioElement) {
  a.play().catch((err) => {
    if (err.name !== 'AbortError') {
      console.warn('Play failed:', err.message)
      usePlayerStore.setState({ isPlaying: false })
    }
  })
}

function getAudio(): HTMLAudioElement | null {
  if (!audio && typeof window !== 'undefined') {
    audio = new Audio()
    audio.preload = 'auto'

    audio.addEventListener('play', () => {
      usePlayerStore.setState({ isPlaying: true })
    })
    audio.addEventListener('pause', () => {
      usePlayerStore.setState({ isPlaying: false })
    })
    audio.addEventListener('ended', () => {
      const { _nextSong, _playDirect } = usePlayerStore.getState()
      if (_nextSong) _playDirect(_nextSong)
    })
    audio.addEventListener('timeupdate', () => {
      usePlayerStore.setState({ currentTime: audio!.currentTime })
    })
    audio.addEventListener('durationchange', () => {
      usePlayerStore.setState({ duration: audio!.duration || 0 })
    })
    let bufferingTimeout: ReturnType<typeof setTimeout> | null = null
    audio.addEventListener('waiting', () => {
      bufferingTimeout = setTimeout(() => {
        usePlayerStore.setState({ isBuffering: true })
      }, 150)
    })
    audio.addEventListener('canplay', () => {
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout)
        bufferingTimeout = null
      }
      usePlayerStore.setState({ isBuffering: false, hasStartedPlaying: true })
    })
    audio.addEventListener('error', () => {
      usePlayerStore.setState({ isPlaying: false, isBuffering: false })
      console.warn('Audio error:', audio?.error?.message)
    })
    audio.addEventListener('stalled', () => {
      console.warn('Audio stalled — network may be slow')
    })
  }
  return audio
}

interface QueueContext {
  folder: string | null
  search: string
  sorting: SongsSortParams
  columnFilters: SongColumnFilters
}

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  isBuffering: boolean
  hasStartedPlaying: boolean
  currentTime: number
  duration: number
  _previousSong: Song | null
  _nextSong: Song | null
  isAdjacentLoading: boolean
  queueFolder: string | null
  queueSearch: string | undefined
  queueSorting: SongsSortParams | undefined
  queueFilters: SongColumnFilters | undefined

  _playDirect: (song: Song) => void
  play: (song: Song, queueContext: QueueContext) => void
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
  seek: (time: number) => void
  setAdjacentSongs: (previous: Song | null, next: Song | null) => void
  setAdjacentLoading: (loading: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  isBuffering: false,
  hasStartedPlaying: false,
  currentTime: 0,
  duration: 0,
  _previousSong: null,
  _nextSong: null,
  isAdjacentLoading: false,
  queueFolder: null,
  queueSearch: undefined,
  queueSorting: undefined,
  queueFilters: undefined,

  _playDirect: (song) => {
    set({ currentSong: song, isBuffering: true, hasStartedPlaying: false })
    const a = getAudio()
    if (a) {
      a.pause()
      a.src = getSongAudioUrl(song.id)
      safePlay(a)
    }
  },

  play: (song, { folder, search, sorting, columnFilters }) => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v)
    set({
      currentSong: song,
      isBuffering: true,
      hasStartedPlaying: false,
      queueFolder: folder,
      queueSearch: search || undefined,
      queueSorting: sorting,
      queueFilters:
        activeFilters.length > 0 ? (Object.fromEntries(activeFilters) as SongColumnFilters) : undefined
    })
    const a = getAudio()
    if (a) {
      a.pause()
      a.src = getSongAudioUrl(song.id)
      safePlay(a)
    }
  },

  togglePlayPause: () => {
    const a = getAudio()
    if (!a || !get().currentSong) return
    if (a.paused) safePlay(a)
    else a.pause()
  },

  playNext: () => {
    const { _nextSong, _playDirect } = get()
    if (_nextSong) _playDirect(_nextSong)
  },

  playPrevious: () => {
    const { _previousSong, _playDirect } = get()
    if (_previousSong) _playDirect(_previousSong)
  },

  seek: (time) => {
    set({ currentTime: time })
    const a = getAudio()
    if (a) debouncedSeek(a, time)
  },

  setAdjacentSongs: (previous, next) => {
    set({ _previousSong: previous, _nextSong: next })
    preloadNextSong(next)
  },

  setAdjacentLoading: (loading) => {
    set({ isAdjacentLoading: loading })
  }
}))

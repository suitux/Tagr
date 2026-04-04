import { create } from 'zustand'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

let audio: HTMLAudioElement | null = null
let preloadAudio: HTMLAudioElement | null = null

let bufferingTimeout: ReturnType<typeof setTimeout> | null = null

const listeners = {
  play: () => usePlayerStore.setState({ isPlaying: true }),
  pause: () => usePlayerStore.setState({ isPlaying: false }),
  ended: () => {
    const { _nextSong, _playDirect } = usePlayerStore.getState()
    if (_nextSong) _playDirect(_nextSong)
  },
  timeupdate: () => {
    if (audio) usePlayerStore.setState({ currentTime: audio.currentTime })
  },
  durationchange: () => {
    if (audio) usePlayerStore.setState({ duration: audio.duration || 0 })
  },
  waiting: () => {
    bufferingTimeout = setTimeout(() => {
      usePlayerStore.setState({ isBuffering: true })
    }, 150)
  },
  canplay: () => {
    if (bufferingTimeout) {
      clearTimeout(bufferingTimeout)
      bufferingTimeout = null
    }
    usePlayerStore.setState({ isBuffering: false, hasStartedPlaying: true })
  },
  error: () => {
    usePlayerStore.setState({ isPlaying: false, isBuffering: false })
    console.warn('Audio error:', audio?.error?.message)
  },
  stalled: () => {
    console.warn('Audio stalled — network may be slow')
  }
}

function attachListeners(el: HTMLAudioElement) {
  for (const [event, handler] of Object.entries(listeners)) {
    el.addEventListener(event, handler)
  }
}

function detachListeners(el: HTMLAudioElement) {
  for (const [event, handler] of Object.entries(listeners)) {
    el.removeEventListener(event, handler)
  }
}

function getAudio(): HTMLAudioElement | null {
  if (!audio && typeof window !== 'undefined') {
    audio = new Audio()
    audio.preload = 'auto'
    attachListeners(audio)
  }
  return audio
}

function getPreloadAudio(): HTMLAudioElement {
  if (!preloadAudio && typeof window !== 'undefined') {
    preloadAudio = new Audio()
    preloadAudio.preload = 'auto'
    preloadAudio.volume = 0
  }
  return preloadAudio!
}

function isPreloaded(song: Song): boolean {
  if (!preloadAudio) return false
  const url = getSongAudioUrl(song.id)
  return preloadAudio.src.endsWith(url) && preloadAudio.readyState >= 2
}

function swapToPreloaded(song: Song) {
  const old = audio!
  const pre = preloadAudio!

  // Detach listeners from old, attach to preloaded
  old.pause()
  detachListeners(old)

  pre.volume = 1
  attachListeners(pre)

  // Swap references
  audio = pre
  preloadAudio = old

  // Reset the old element for future preloading
  preloadAudio.volume = 0
  preloadAudio.src = ''

  usePlayerStore.setState({
    currentSong: song,
    isBuffering: false,
    hasStartedPlaying: false,
    duration: audio.duration || 0,
    currentTime: audio.currentTime
  })
  safePlay(audio)
}

function preloadNextSong(song: Song | null) {
  if (!song || typeof window === 'undefined') return
  const p = getPreloadAudio()
  const url = getSongAudioUrl(song.id)
  if (!p.src.endsWith(url)) {
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
  a.play().catch(err => {
    if (err.name !== 'AbortError') {
      console.warn('Play failed:', err.message)
      usePlayerStore.setState({ isPlaying: false })
    }
  })
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

  _playDirect: song => {
    // If preloaded, swap elements instead of making a new request
    if (isPreloaded(song)) {
      swapToPreloaded(song)
      return
    }
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
      queueFilters: activeFilters.length > 0 ? (Object.fromEntries(activeFilters) as SongColumnFilters) : undefined
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

  seek: time => {
    set({ currentTime: time })
    const a = getAudio()
    if (a) debouncedSeek(a, time)
  },

  setAdjacentSongs: (previous, next) => {
    set({ _previousSong: previous, _nextSong: next })
    preloadNextSong(next)
  },

  setAdjacentLoading: loading => {
    set({ isAdjacentLoading: loading })
  }
}))

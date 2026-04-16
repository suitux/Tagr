import { create } from 'zustand'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

let audio: HTMLAudioElement | null = null

let bufferingTimeout: ReturnType<typeof setTimeout> | null = null

const MAX_HISTORY = 100

const listeners = {
  play: () => usePlayerStore.setState({ isPlaying: true }),
  pause: () => usePlayerStore.setState({ isPlaying: false }),
  ended: () => {
    usePlayerStore.getState().playNext()
  },
  timeupdate: () => {
    if (audio) usePlayerStore.setState({ currentTime: audio.currentTime })
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

export function getAudio(): HTMLAudioElement | null {
  if (!audio && typeof window !== 'undefined') {
    audio = new Audio()
    audio.preload = 'auto'
    audio.loop = usePlayerStore.getState().repeat
    for (const [event, handler] of Object.entries(listeners)) {
      audio.addEventListener(event, handler)
    }
  }
  return audio
}

function safePlay(a: HTMLAudioElement) {
  a.play().catch(err => {
    if (err.name !== 'AbortError') {
      console.warn('Play failed:', err.message)
      usePlayerStore.setState({ isPlaying: false })
    }
  })
}

function pushToHistory(
  history: Song[],
  index: number,
  song: Song
): { _shuffleHistory: Song[]; _shuffleHistoryIndex: number } {
  const truncated = history.slice(0, index + 1)
  truncated.push(song)
  if (truncated.length > MAX_HISTORY) {
    const drop = truncated.length - MAX_HISTORY
    return { _shuffleHistory: truncated.slice(drop), _shuffleHistoryIndex: truncated.length - drop - 1 }
  }
  return { _shuffleHistory: truncated, _shuffleHistoryIndex: truncated.length - 1 }
}

interface QueueContext {
  folder: string | null
  smartPlaylistId?: number | null
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
  _previousSong: Song | null
  _nextSong: Song | null
  isAdjacentLoading: boolean
  queueFolder: string | null
  queueSmartPlaylistId: number | null
  queueSearch: string | undefined
  queueSorting: SongsSortParams | undefined
  queueFilters: SongColumnFilters | undefined
  shuffle: boolean
  shuffleTick: number
  repeat: boolean
  _shuffleHistory: Song[]
  _shuffleHistoryIndex: number

  _playDirect: (song: Song, opts?: { fromHistory?: boolean }) => void
  play: (song: Song, queueContext: QueueContext) => void
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
  seek: (time: number) => void
  setAdjacentSongs: (previous: Song | null, next: Song | null) => void
  setAdjacentLoading: (loading: boolean) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  isBuffering: false,
  hasStartedPlaying: false,
  currentTime: 0,
  _previousSong: null,
  _nextSong: null,
  isAdjacentLoading: false,
  queueFolder: null,
  queueSmartPlaylistId: null,
  queueSearch: undefined,
  queueSorting: undefined,
  queueFilters: undefined,
  shuffle: false,
  shuffleTick: 0,
  repeat: false,
  _shuffleHistory: [],
  _shuffleHistoryIndex: -1,

  _playDirect: (song, opts) => {
    set(state => {
      const historyUpdate =
        state.shuffle && !opts?.fromHistory
          ? pushToHistory(state._shuffleHistory, state._shuffleHistoryIndex, song)
          : {}
      return {
        currentSong: song,
        isBuffering: true,
        hasStartedPlaying: false,
        shuffleTick: state.shuffleTick + 1,
        ...historyUpdate
      }
    })
    const a = getAudio()
    if (a) {
      a.pause()
      a.src = getSongAudioUrl(song.id)
      safePlay(a)
    }
  },

  play: (song, { folder, smartPlaylistId, search, sorting, columnFilters }) => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v)
    set(state => ({
      currentSong: song,
      isBuffering: true,
      hasStartedPlaying: false,
      queueFolder: folder,
      queueSmartPlaylistId: smartPlaylistId ?? null,
      queueSearch: search || undefined,
      queueSorting: sorting,
      queueFilters: activeFilters.length > 0 ? (Object.fromEntries(activeFilters) as SongColumnFilters) : undefined,
      shuffleTick: state.shuffleTick + 1,
      _shuffleHistory: [song],
      _shuffleHistoryIndex: 0
    }))
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
    const state = get()
    if (state.shuffle) {
      const { _shuffleHistory, _shuffleHistoryIndex } = state
      if (_shuffleHistoryIndex < _shuffleHistory.length - 1) {
        const nextIndex = _shuffleHistoryIndex + 1
        const song = _shuffleHistory[nextIndex]
        set({ _shuffleHistoryIndex: nextIndex })
        state._playDirect(song, { fromHistory: true })
        return
      }
    }
    const { _nextSong, _playDirect } = state
    if (_nextSong) _playDirect(_nextSong)
  },

  playPrevious: () => {
    const state = get()
    if (state.shuffle) {
      const { _shuffleHistory, _shuffleHistoryIndex } = state
      if (_shuffleHistoryIndex > 0) {
        const prevIndex = _shuffleHistoryIndex - 1
        const song = _shuffleHistory[prevIndex]
        set({ _shuffleHistoryIndex: prevIndex })
        state._playDirect(song, { fromHistory: true })
      }
      return
    }
    const { _previousSong, _playDirect } = state
    if (_previousSong) _playDirect(_previousSong)
  },

  seek: time => {
    set({ currentTime: time })
    const a = getAudio()
    if (a) a.currentTime = time
  },

  setAdjacentSongs: (previous, next) => {
    set({ _previousSong: previous, _nextSong: next })
  },

  setAdjacentLoading: loading => {
    set({ isAdjacentLoading: loading })
  },

  toggleShuffle: () => {
    set(state => {
      const newShuffle = !state.shuffle
      if (newShuffle && state.currentSong) {
        return {
          shuffle: true,
          _shuffleHistory: [state.currentSong],
          _shuffleHistoryIndex: 0
        }
      }
      return {
        shuffle: newShuffle,
        _shuffleHistory: [],
        _shuffleHistoryIndex: -1
      }
    })
  },

  toggleRepeat: () => {
    const next = !get().repeat
    set({ repeat: next })
    const a = getAudio()
    if (a) a.loop = next
  }
}))

import { create } from 'zustand'
import type { Song, SongColumnFilters } from '@/features/songs/domain'
import type { SongsSortParams } from '@/features/songs/hooks/use-songs-by-folder'
import { getSongAudioUrl } from '@/features/songs/song-file-helpers'

let audio: HTMLAudioElement | null = null

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
  currentTime: number
  duration: number
  _previousSong: Song | null
  _nextSong: Song | null
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
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  _previousSong: null,
  _nextSong: null,
  queueFolder: null,
  queueSearch: undefined,
  queueSorting: undefined,
  queueFilters: undefined,

  _playDirect: (song) => {
    set({ currentSong: song })
    const a = getAudio()
    if (a) {
      a.src = getSongAudioUrl(song.id)
      a.play()
    }
  },

  play: (song, { folder, search, sorting, columnFilters }) => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v)
    set({
      currentSong: song,
      queueFolder: folder,
      queueSearch: search || undefined,
      queueSorting: sorting,
      queueFilters:
        activeFilters.length > 0 ? (Object.fromEntries(activeFilters) as SongColumnFilters) : undefined
    })
    const a = getAudio()
    if (a) {
      a.src = getSongAudioUrl(song.id)
      a.play()
    }
  },

  togglePlayPause: () => {
    const a = getAudio()
    if (!a || !get().currentSong) return
    if (a.paused) a.play()
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
    const a = getAudio()
    if (a) a.currentTime = time
  },

  setAdjacentSongs: (previous, next) => {
    set({ _previousSong: previous, _nextSong: next })
  }
}))

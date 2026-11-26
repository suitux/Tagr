import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VOLUME_STORAGE_KEY } from '@/features/player/volume'
import type { Song } from '@/features/songs/domain'

// The stored volume is read once when the store module is created, so each test
// imports a fresh copy of the module after preparing localStorage.
async function loadStore() {
  vi.resetModules()
  return import('./player-store')
}

describe('player store volume', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to full volume when nothing is stored', async () => {
    const { usePlayerStore } = await loadStore()
    expect(usePlayerStore.getState().volume).toBe(1)
  })

  it('restores the stored volume', async () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, '0.35')
    const { usePlayerStore } = await loadStore()
    expect(usePlayerStore.getState().volume).toBe(0.35)
  })

  it('falls back to full volume for an invalid stored value', async () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, 'loud')
    const { usePlayerStore } = await loadStore()
    expect(usePlayerStore.getState().volume).toBe(1)
  })

  it('clamps the volume to the 0..1 range', async () => {
    const { usePlayerStore } = await loadStore()
    usePlayerStore.getState().setVolume(1.7)
    expect(usePlayerStore.getState().volume).toBe(1)
    usePlayerStore.getState().setVolume(-0.2)
    expect(usePlayerStore.getState().volume).toBe(0)
  })

  it('persists the volume and applies it to the audio element', async () => {
    const { usePlayerStore, getAudio } = await loadStore()
    usePlayerStore.getState().setVolume(0.4)
    expect(localStorage.getItem(VOLUME_STORAGE_KEY)).toBe('0.4')
    expect(getAudio()?.volume).toBe(0.4)
  })

  it('applies the stored volume when the audio element is created', async () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, '0.2')
    const { getAudio } = await loadStore()
    expect(getAudio()?.volume).toBe(0.2)
  })
})

describe('player store removeSongs', () => {
  const song = (id: number) => ({ id, title: `Song ${id}` }) as Song

  beforeEach(() => {
    localStorage.clear()
    // jsdom implements neither playback nor loading
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
  })

  it('skips to the next song when the one playing is removed', async () => {
    const { usePlayerStore } = await loadStore()
    usePlayerStore.setState({ currentSong: song(1), _previousSong: song(9), _nextSong: song(2) })

    usePlayerStore.getState().removeSongs(new Set([1]))

    expect(usePlayerStore.getState().currentSong?.id).toBe(2)
  })

  it('stops when the song playing is removed and nothing follows it', async () => {
    const { usePlayerStore } = await loadStore()
    usePlayerStore.setState({ currentSong: song(1), isPlaying: true, _nextSong: song(2) })

    usePlayerStore.getState().removeSongs(new Set([1, 2]))

    expect(usePlayerStore.getState()).toMatchObject({ currentSong: null, isPlaying: false, _nextSong: null })
  })

  it('drops removed songs from the queue without touching the one playing', async () => {
    const { usePlayerStore } = await loadStore()
    usePlayerStore.setState({
      currentSong: song(3),
      shuffle: true,
      _previousSong: song(2),
      _nextSong: song(4),
      _shuffleHistory: [song(1), song(2), song(3), song(4)],
      _shuffleHistoryIndex: 2
    })

    usePlayerStore.getState().removeSongs(new Set([2, 4]))

    const state = usePlayerStore.getState()
    expect(state.currentSong?.id).toBe(3)
    expect(state._previousSong).toBeNull()
    expect(state._nextSong).toBeNull()
    expect(state._shuffleHistory.map(entry => entry.id)).toEqual([1, 3])
    expect(state._shuffleHistoryIndex).toBe(1)
  })
})

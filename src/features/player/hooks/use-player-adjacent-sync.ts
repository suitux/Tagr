import { useEffect } from 'react'
import { useAdjacentSongs } from '@/features/songs/hooks/use-adjacent-songs'
import { usePlayerStore } from '@/stores/player-store'

/**
 * Syncs adjacent songs (previous/next) from the API into the player store.
 * Must be mounted in a component that is always present (e.g. ResponsiveLayout).
 */
export function usePlayerAdjacentSync() {
  const currentSong = usePlayerStore(s => s.currentSong)
  const queueFolder = usePlayerStore(s => s.queueFolder)
  const queueSmartPlaylistId = usePlayerStore(s => s.queueSmartPlaylistId)
  const queueSearch = usePlayerStore(s => s.queueSearch)
  const queueSorting = usePlayerStore(s => s.queueSorting)
  const queueFilters = usePlayerStore(s => s.queueFilters)
  const shuffle = usePlayerStore(s => s.shuffle)
  const shuffleTick = usePlayerStore(s => s.shuffleTick)
  const shuffleHistoryIndex = usePlayerStore(s => s._shuffleHistoryIndex)
  const shuffleHistory = usePlayerStore(s => s._shuffleHistory)
  const setAdjacentSongs = usePlayerStore(s => s.setAdjacentSongs)
  const setAdjacentLoading = usePlayerStore(s => s.setAdjacentLoading)

  const { data, isPending } = useAdjacentSongs(
    currentSong?.id ?? null,
    queueFolder,
    queueSearch,
    queueSorting,
    queueFilters,
    queueSmartPlaylistId,
    shuffle,
    shuffleTick
  )

  useEffect(() => {
    if (shuffle) {
      const midHistory = shuffleHistoryIndex < shuffleHistory.length - 1
      const historyPrev = shuffleHistoryIndex > 0 ? shuffleHistory[shuffleHistoryIndex - 1] : null
      setAdjacentSongs(
        historyPrev,
        midHistory ? shuffleHistory[shuffleHistoryIndex + 1] : (data?.next ?? null)
      )
    } else {
      setAdjacentSongs(data?.previous ?? null, data?.next ?? null)
    }
  }, [data, setAdjacentSongs, shuffle, shuffleHistory, shuffleHistoryIndex])

  useEffect(() => {
    setAdjacentLoading(isPending)
  }, [isPending, setAdjacentLoading])
}

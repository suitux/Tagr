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
  const queueSearch = usePlayerStore(s => s.queueSearch)
  const queueSorting = usePlayerStore(s => s.queueSorting)
  const queueFilters = usePlayerStore(s => s.queueFilters)
  const setAdjacentSongs = usePlayerStore(s => s.setAdjacentSongs)
  const setAdjacentLoading = usePlayerStore(s => s.setAdjacentLoading)

  const { data, isPending } = useAdjacentSongs(
    currentSong?.id ?? null,
    queueFolder,
    queueSearch,
    queueSorting,
    queueFilters
  )

  useEffect(() => {
    setAdjacentSongs(data?.previous ?? null, data?.next ?? null)
  }, [data, setAdjacentSongs])

  useEffect(() => {
    setAdjacentLoading(isPending)
  }, [isPending, setAdjacentLoading])
}

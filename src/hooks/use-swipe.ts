import { useDrag } from '@use-gesture/react'

type SwipeDirection = 'up' | 'down' | 'left' | 'right'

interface UseSwipeOptions {
  direction: SwipeDirection
  onSwipe: () => void
  threshold?: number
  enabled?: boolean
}

export function useSwipe({ direction, onSwipe, threshold = 80, enabled = true }: UseSwipeOptions) {
  const isHorizontal = direction === 'left' || direction === 'right'

  return useDrag(
    ({ movement: [mx, my], direction: [dx, dy], cancel }) => {
      if (!enabled) return

      const movement = isHorizontal ? mx : my
      const dir = isHorizontal ? dx : dy
      const positive = direction === 'right' || direction === 'down'

      if ((positive ? dir > 0 : dir < 0) && Math.abs(movement) > threshold) {
        cancel()
        onSwipe()
      }
    },
    {
      axis: isHorizontal ? 'x' : 'y',
      filterTaps: true
    }
  )
}

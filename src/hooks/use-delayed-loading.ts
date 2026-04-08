import { useEffect, useRef, useState } from 'react'

export function useDelayedLoading(isLoading: boolean, delay = 500): boolean {
  const [showLoading, setShowLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => setShowLoading(true), delay)
    } else {
      timerRef.current = setTimeout(() => setShowLoading(false), 0)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isLoading, delay])

  return showLoading
}

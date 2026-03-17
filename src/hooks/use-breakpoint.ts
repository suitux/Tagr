'use client'

import { useSyncExternalStore } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

const mobileQuery = '(max-width: 767px)'
const tabletQuery = '(min-width: 768px) and (max-width: 1024px)'

function getBreakpoint(): Breakpoint {
  if (window.matchMedia(mobileQuery).matches) return 'mobile'
  if (window.matchMedia(tabletQuery).matches) return 'tablet'
  return 'desktop'
}

function subscribe(callback: () => void) {
  const mql1 = window.matchMedia(mobileQuery)
  const mql2 = window.matchMedia(tabletQuery)
  mql1.addEventListener('change', callback)
  mql2.addEventListener('change', callback)
  return () => {
    mql1.removeEventListener('change', callback)
    mql2.removeEventListener('change', callback)
  }
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getBreakpoint, () => 'desktop' as Breakpoint)
}

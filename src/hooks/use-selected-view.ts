'use client'

import { usePathname } from 'next/navigation'
import { RECENT_LISTENS_ROUTE, TRASH_ROUTE } from '@/lib/library-routes'

export type MainView = 'recent' | 'trash'

/** Views that replace the folder/playlist listing in the main panel. */
export function useSelectedView() {
  const pathname = usePathname()
  const selectedView: MainView | null =
    pathname === RECENT_LISTENS_ROUTE ? 'recent' : pathname === TRASH_ROUTE ? 'trash' : null

  return { selectedView }
}

'use client'

import { useQueryState } from 'nuqs'

export type MainView = 'recent'

/** Views that replace the folder/playlist listing in the main panel. */
export function useSelectedView() {
  const [selectedView, setSelectedView] = useQueryState('view', {
    history: 'replace',
    parse: (value): MainView | null => (value === 'recent' ? 'recent' : null)
  })

  return { selectedView, setSelectedView }
}

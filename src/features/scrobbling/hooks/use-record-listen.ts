'use client'

import { useCallback } from 'react'
import { RECENT_LISTENS_QUERY_KEY } from '@/features/scrobbling/hooks/use-recent-listens'
import { api } from '@/lib/axios'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Fire-and-forget calls used by the listen tracker. Failures are logged and dropped:
 * losing a listen must never interrupt playback.
 */
export function useRecordListen() {
  const queryClient = useQueryClient()

  const recordListen = useCallback(
    async (songId: number, listenedAt: Date) => {
      try {
        await api.post('/listens', { songId, listenedAt: listenedAt.toISOString() })
        void queryClient.invalidateQueries({ queryKey: RECENT_LISTENS_QUERY_KEY })
      } catch (error) {
        console.warn('Could not record listen:', error instanceof Error ? error.message : error)
      }
    },
    [queryClient]
  )

  const sendNowPlaying = useCallback(async (songId: number) => {
    try {
      await api.post('/listens/now-playing', { songId })
    } catch (error) {
      console.warn('Could not send now playing:', error instanceof Error ? error.message : error)
    }
  }, [])

  return { recordListen, sendNowPlaying }
}

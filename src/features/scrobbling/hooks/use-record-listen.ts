'use client'

import { useCallback } from 'react'
import { RECENT_LISTENS_QUERY_KEY } from '@/features/scrobbling/hooks/use-recent-listens'
import { api } from '@/lib/axios'
import { useQueryClient } from '@tanstack/react-query'

interface CreateListenResponse {
  success: boolean
  listenId?: number
}

export function useRecordListen() {
  const queryClient = useQueryClient()

  const recordListen = useCallback(
    async (songId: number, listenedAt: Date): Promise<number | null> => {
      try {
        const { data } = await api.post<CreateListenResponse>('/listens', {
          songId,
          listenedAt: listenedAt.toISOString()
        })
        void queryClient.invalidateQueries({ queryKey: RECENT_LISTENS_QUERY_KEY })

        return data.listenId ?? null
      } catch (error) {
        console.warn('Could not record listen:', error instanceof Error ? error.message : error)
        return null
      }
    },
    [queryClient]
  )

  const scrobbleListen = useCallback(async (listenId: number) => {
    try {
      await api.post(`/listens/${listenId}/scrobble`)
    } catch (error) {
      console.warn('Could not scrobble listen:', error instanceof Error ? error.message : error)
    }
  }, [])

  const sendNowPlaying = useCallback(async (songId: number) => {
    try {
      await api.post('/listens/now-playing', { songId })
    } catch (error) {
      console.warn('Could not send now playing:', error instanceof Error ? error.message : error)
    }
  }, [])

  return { recordListen, scrobbleListen, sendNowPlaying }
}

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { historyThresholdSeconds, isScrobbleableDuration, listenThresholdSeconds } from '@/features/scrobbling/domain'
import { useRecordListen } from '@/features/scrobbling/hooks/use-record-listen'
import { useScrobbleAccounts } from '@/features/scrobbling/hooks/use-scrobble-accounts'
import { usePlayerStore } from '@/stores/player-store'

/** Position (in seconds) below which a jump backwards means the track restarted. */
const LOOP_RESTART_MAX_S = 1
const LOOP_RESTART_MIN_ELAPSED_S = 5

/**
 * Turns playback into listens: one "now playing" when a track starts, one row in Tagr's own
 * history as soon as the track is really being played, and a scrobble of that same row once it
 * passes the provider threshold (half the track or 4 minutes, tracks under 30 s excluded).
 *
 * Elapsed playback is counted with a ticker rather than read from `currentTime`, because the
 * waveform scrubs the shared audio element directly (see waveform.tsx) — position says nothing
 * about how much the user really heard.
 *
 * Must be mounted in an always-present component (ResponsiveLayout).
 */
export function useListenTracker() {
  const currentSong = usePlayerStore(s => s.currentSong)
  const isPlaying = usePlayerStore(s => s.isPlaying)
  const { recordListen, scrobbleListen, sendNowPlaying } = useRecordListen()
  const { data: accounts } = useScrobbleAccounts()

  const elapsedRef = useRef(0)
  const startedAtRef = useRef<Date | null>(null)
  const recordedRef = useRef(false)
  const scrobbledRef = useRef(false)
  // The scrobble waits on the history row, which may still be in flight when the threshold hits.
  const listenIdRef = useRef<Promise<number | null> | null>(null)

  // Read inside callbacks without restarting the tracker when the settings change.
  const hasEnabledAccountRef = useRef(false)
  const hasEnabledAccount = accounts?.some(account => account.enabled) ?? false

  useEffect(() => {
    hasEnabledAccountRef.current = hasEnabledAccount
  }, [hasEnabledAccount])

  const songId = currentSong?.id
  const duration = currentSong?.duration

  const startPlay = useCallback(() => {
    elapsedRef.current = 0
    recordedRef.current = false
    scrobbledRef.current = false
    listenIdRef.current = null
    startedAtRef.current = songId ? new Date() : null

    if (songId && hasEnabledAccountRef.current) {
      void sendNowPlaying(songId)
    }
  }, [songId, sendNowPlaying])

  useEffect(() => {
    startPlay()
  }, [startPlay])

  useEffect(() => {
    if (!isPlaying || !songId) return

    const interval = setInterval(() => {
      elapsedRef.current += 1

      const startedAt = startedAtRef.current
      if (!startedAt) return

      if (!recordedRef.current && elapsedRef.current >= historyThresholdSeconds(duration)) {
        recordedRef.current = true
        listenIdRef.current = recordListen(songId, startedAt)
      }

      if (scrobbledRef.current || !hasEnabledAccountRef.current) return
      if (!isScrobbleableDuration(duration)) return
      if (elapsedRef.current < listenThresholdSeconds(duration)) return

      scrobbledRef.current = true
      const pendingListenId = listenIdRef.current
      void pendingListenId?.then(listenId => {
        if (listenId !== null) void scrobbleListen(listenId)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, songId, duration, recordListen, scrobbleListen])

  // With repeat on, `audio.loop` is true and `ended` never fires, so a looping track is only
  // visible as the position jumping back to zero.
  useEffect(
    () =>
      usePlayerStore.subscribe((state, previous) => {
        if (!state.repeat || state.currentSong?.id !== previous.currentSong?.id) return

        const restarted = previous.currentTime > LOOP_RESTART_MIN_ELAPSED_S && state.currentTime <= LOOP_RESTART_MAX_S
        if (restarted && elapsedRef.current > LOOP_RESTART_MIN_ELAPSED_S) {
          startPlay()
        }
      }),
    [startPlay]
  )
}

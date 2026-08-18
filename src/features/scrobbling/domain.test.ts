import { describe, expect, it } from 'vitest'
import {
  historyThresholdSeconds,
  isScrobbleableDuration,
  listenThresholdSeconds,
  LOCAL_HISTORY_THRESHOLD_S,
  SCROBBLE_LISTEN_THRESHOLD_S
} from './domain'

describe('listenThresholdSeconds', () => {
  it('uses half the track when it is shorter than 8 minutes', () => {
    expect(listenThresholdSeconds(60)).toBe(30)
    expect(listenThresholdSeconds(300)).toBe(150)
  })

  it('caps at 4 minutes for long tracks', () => {
    expect(listenThresholdSeconds(600)).toBe(SCROBBLE_LISTEN_THRESHOLD_S)
    expect(listenThresholdSeconds(3600)).toBe(SCROBBLE_LISTEN_THRESHOLD_S)
  })

  it('falls back to 4 minutes when the duration is unknown', () => {
    expect(listenThresholdSeconds(null)).toBe(SCROBBLE_LISTEN_THRESHOLD_S)
    expect(listenThresholdSeconds(undefined)).toBe(SCROBBLE_LISTEN_THRESHOLD_S)
    expect(listenThresholdSeconds(0)).toBe(SCROBBLE_LISTEN_THRESHOLD_S)
  })
})

describe('historyThresholdSeconds', () => {
  it('uses the fixed threshold for a normal track', () => {
    expect(historyThresholdSeconds(180)).toBe(LOCAL_HISTORY_THRESHOLD_S)
  })

  it('halves the threshold for tracks shorter than twice it', () => {
    expect(historyThresholdSeconds(4)).toBe(2)
  })

  it('falls back to the fixed threshold when the duration is unknown', () => {
    expect(historyThresholdSeconds(null)).toBe(LOCAL_HISTORY_THRESHOLD_S)
    expect(historyThresholdSeconds(0)).toBe(LOCAL_HISTORY_THRESHOLD_S)
  })

  it('lets a play enter the history well before it can be scrobbled', () => {
    expect(historyThresholdSeconds(180)).toBeLessThan(listenThresholdSeconds(180))
  })
})

describe('isScrobbleableDuration', () => {
  it('rejects tracks shorter than 30 seconds', () => {
    expect(isScrobbleableDuration(29)).toBe(false)
    expect(isScrobbleableDuration(30)).toBe(true)
  })

  it('rejects an unknown duration', () => {
    expect(isScrobbleableDuration(null)).toBe(false)
  })
})

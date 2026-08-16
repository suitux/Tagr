import { describe, expect, it } from 'vitest'
import { isScrobbleableDuration, listenThresholdSeconds, SCROBBLE_LISTEN_THRESHOLD_S } from './domain'

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

describe('isScrobbleableDuration', () => {
  it('rejects tracks shorter than 30 seconds', () => {
    expect(isScrobbleableDuration(29)).toBe(false)
    expect(isScrobbleableDuration(30)).toBe(true)
  })

  it('rejects an unknown duration', () => {
    expect(isScrobbleableDuration(null)).toBe(false)
  })
})

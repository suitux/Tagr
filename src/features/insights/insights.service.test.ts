import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  collectInsights,
  getEnvInsightsOverride,
  getInsightsNoticeState,
  isInsightsEnabled,
  sendInsights,
  setInsightsEnabled
} from './insights.service'

const { mockGetAppProperty, mockSetAppProperty } = vi.hoisted(() => ({
  mockGetAppProperty: vi.fn(),
  mockSetAppProperty: vi.fn()
}))

vi.mock('./insights.repository', () => ({
  getAppProperty: (...args: unknown[]) => mockGetAppProperty(...args),
  setAppProperty: (...args: unknown[]) => mockSetAppProperty(...args),
  countSongsByExtension: async () => ({ flac: 10, mp3: 5 }),
  countRecentActivity: async () => ({ metadataEdits: 7, editedSongs: 3, listens: 20, listeners: 2 }),
  countFeatureUsage: async () => ({
    songs: 15,
    users: 1,
    smartPlaylists: 2,
    savedFilters: 0,
    sharedLinks: 1,
    scrobbleAccounts: { listenbrainz: 1 }
  })
}))

vi.mock('@/features/songs/song-file-helpers', () => ({
  getMusicFolders: () => ['/music/a', '/music/b']
}))

describe('insights.service', () => {
  beforeEach(() => {
    mockGetAppProperty.mockReset()
    mockSetAppProperty.mockReset()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getEnvInsightsOverride', () => {
    it('is null when no env var is set', () => {
      vi.stubEnv('TAGR_INSIGHTS', '')
      vi.stubEnv('DO_NOT_TRACK', '')
      expect(getEnvInsightsOverride()).toBeNull()
    })

    it.each([
      ['TAGR_INSIGHTS', 'false'],
      ['TAGR_INSIGHTS', 'off'],
      ['DO_NOT_TRACK', '1'],
      ['DO_NOT_TRACK', 'true']
    ])('disables with %s=%s', (name, value) => {
      vi.stubEnv(name, value)
      expect(getEnvInsightsOverride()).toBe(false)
    })
  })

  describe('isInsightsEnabled', () => {
    it('is enabled by default', async () => {
      mockGetAppProperty.mockResolvedValue(null)
      expect(await isInsightsEnabled()).toBe(true)
    })

    it('respects the Settings toggle', async () => {
      mockGetAppProperty.mockResolvedValue('false')
      expect(await isInsightsEnabled()).toBe(false)
    })

    it('lets the env var win over the toggle', async () => {
      vi.stubEnv('DO_NOT_TRACK', '1')
      mockGetAppProperty.mockResolvedValue('true')
      expect(await isInsightsEnabled()).toBe(false)
    })
  })

  describe('collectInsights', () => {
    it('reuses the stored instance id', async () => {
      mockGetAppProperty.mockResolvedValue('existing-id')

      const data = await collectInsights()

      expect(data.id).toBe('existing-id')
      expect(mockSetAppProperty).not.toHaveBeenCalled()
    })

    it('creates and stores an id on first run', async () => {
      mockGetAppProperty.mockResolvedValue(null)

      const data = await collectInsights()

      expect(data.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(mockSetAppProperty).toHaveBeenCalledWith('insightsId', data.id)
    })

    it('reports counts only, adding the env admin to the user total', async () => {
      mockGetAppProperty.mockResolvedValue('id')

      const data = await collectInsights()

      expect(data).toMatchObject({
        schema: 1,
        library: { songs: 15, musicFolders: 2, fileExtensions: { flac: 10, mp3: 5 } },
        users: { total: 2, listeners7d: 2 },
        usage7d: { metadataEdits: 7, editedSongs: 3, listens: 20 },
        features: { smartPlaylists: 2, savedFilters: 0, sharedLinks: 1, scrobbleAccounts: { listenbrainz: 1 } }
      })
    })
  })

  describe('sendInsights', () => {
    it('does not call the network when disabled', async () => {
      vi.stubEnv('TAGR_INSIGHTS', 'false')
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await sendInsights()

      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('posts the report and records when it was sent', async () => {
      vi.stubEnv('TAGR_INSIGHTS_ENDPOINT', 'http://localhost:8787/collect')
      mockGetAppProperty.mockResolvedValue('id')
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
      vi.stubGlobal('fetch', fetchMock)

      await sendInsights()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/collect', expect.objectContaining({ method: 'POST' }))
      expect(mockSetAppProperty).toHaveBeenCalledWith('insightsLastSentAt', expect.any(String))
    })

    it('holds reports back until an admin has seen the notice', async () => {
      mockGetAppProperty.mockImplementation(async (key: string) => (key === 'insightsNoticeSeenAt' ? null : 'id'))
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await sendInsights()

      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('swallows network errors', async () => {
      mockGetAppProperty.mockResolvedValue('id')
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

      await expect(sendInsights()).resolves.toBeUndefined()
      expect(mockSetAppProperty).not.toHaveBeenCalledWith('insightsLastSentAt', expect.anything())
    })
  })

  describe('notice', () => {
    it('is pending until the admin answers', async () => {
      mockGetAppProperty.mockResolvedValue(null)
      expect(await getInsightsNoticeState()).toEqual({ pending: true })
    })

    it('is settled once answered', async () => {
      mockGetAppProperty.mockResolvedValue('2026-10-08T00:00:00.000Z')
      expect(await getInsightsNoticeState()).toEqual({ pending: false })
    })

    it('is not needed when an env var already opted out', async () => {
      vi.stubEnv('TAGR_INSIGHTS', 'false')
      mockGetAppProperty.mockResolvedValue(null)
      expect(await getInsightsNoticeState()).toEqual({ pending: false })
    })

    it('records the answer together with the choice', async () => {
      mockGetAppProperty.mockResolvedValue(null)

      await setInsightsEnabled(false)

      expect(mockSetAppProperty).toHaveBeenCalledWith('insightsEnabled', 'false')
      expect(mockSetAppProperty).toHaveBeenCalledWith('insightsNoticeSeenAt', expect.any(String))
    })

    it('keeps the first answer date when toggled again', async () => {
      mockGetAppProperty.mockResolvedValue('2026-10-08T00:00:00.000Z')

      await setInsightsEnabled(true)

      expect(mockSetAppProperty).not.toHaveBeenCalledWith('insightsNoticeSeenAt', expect.anything())
    })
  })
})

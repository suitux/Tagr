import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrobbleError } from '@/features/scrobbling/providers/provider'
import { MAX_SCROBBLE_ATTEMPTS } from './domain'
import { drainQueue, retryDelayMs } from './scrobble-queue.service'

const {
  mockSubmitListens,
  mockFindDueQueueItems,
  mockDeleteQueueItems,
  mockRescheduleQueueItems,
  mockDeleteAccountQueue,
  mockUpdateScrobbleAccount
} = vi.hoisted(() => ({
  mockSubmitListens: vi.fn(),
  mockFindDueQueueItems: vi.fn(),
  mockDeleteQueueItems: vi.fn(),
  mockRescheduleQueueItems: vi.fn(),
  mockDeleteAccountQueue: vi.fn(),
  mockUpdateScrobbleAccount: vi.fn()
}))

vi.mock('@/features/scrobbling/providers/registry', () => ({
  getScrobbleProvider: () => ({
    id: 'listenbrainz',
    defaultApiRoot: 'https://api.listenbrainz.org',
    validateToken: vi.fn(),
    submitNowPlaying: vi.fn(),
    submitListens: (...args: unknown[]) => mockSubmitListens(...args)
  })
}))

vi.mock('@/features/scrobbling/scrobbling.repository', () => ({
  findDueQueueItems: (...args: unknown[]) => mockFindDueQueueItems(...args),
  deleteQueueItems: (...args: unknown[]) => mockDeleteQueueItems(...args),
  rescheduleQueueItems: (...args: unknown[]) => mockRescheduleQueueItems(...args),
  deleteAccountQueue: (...args: unknown[]) => mockDeleteAccountQueue(...args),
  updateScrobbleAccount: (...args: unknown[]) => mockUpdateScrobbleAccount(...args)
}))

vi.mock('@/lib/crypto', () => ({
  decryptSecret: (value: string) => value.replace('encrypted:', '')
}))

const account = {
  id: 1,
  userId: 'admin',
  provider: 'listenbrainz',
  enabled: true,
  apiRoot: null,
  encryptedToken: 'encrypted:token',
  username: 'someone',
  lastError: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

function queueItem(id: number, attempts = 0) {
  return {
    id,
    accountId: 1,
    payload: JSON.stringify({ listenedAt: '2026-08-16T10:00:00.000Z', trackName: 'T', artistName: 'A' }),
    attempts,
    lastError: null,
    nextAttemptAt: new Date(),
    createdAt: new Date()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('retryDelayMs', () => {
  it('backs off exponentially from one minute', () => {
    expect(retryDelayMs(1)).toBe(2 * 60 * 1000)
    expect(retryDelayMs(3)).toBe(8 * 60 * 1000)
  })

  it('never waits more than a day', () => {
    expect(retryDelayMs(MAX_SCROBBLE_ATTEMPTS)).toBeLessThanOrEqual(24 * 60 * 60 * 1000)
    expect(retryDelayMs(99)).toBe(24 * 60 * 60 * 1000)
  })
})

describe('drainQueue', () => {
  it('does nothing when the queue is empty', async () => {
    mockFindDueQueueItems.mockResolvedValue([])

    await drainQueue(account)

    expect(mockSubmitListens).not.toHaveBeenCalled()
  })

  it('deletes the items it managed to submit', async () => {
    mockFindDueQueueItems.mockResolvedValue([queueItem(1), queueItem(2)])
    mockSubmitListens.mockResolvedValue(undefined)

    await drainQueue(account)

    expect(mockSubmitListens).toHaveBeenCalledWith({ token: 'token', apiRoot: 'https://api.listenbrainz.org' }, [
      expect.objectContaining({ trackName: 'T' }),
      expect.objectContaining({ trackName: 'T' })
    ])
    expect(mockDeleteQueueItems).toHaveBeenCalledWith([1, 2])
  })

  it('reschedules with backoff on a retryable failure', async () => {
    mockFindDueQueueItems.mockResolvedValue([queueItem(1, 2)])
    mockSubmitListens.mockRejectedValue(new ScrobbleError('rate limited', 429, true))

    await drainQueue(account)

    expect(mockDeleteQueueItems).not.toHaveBeenCalled()
    expect(mockRescheduleQueueItems).toHaveBeenCalledWith([1], 'rate limited', expect.any(Date))
  })

  it('drops items that ran out of attempts', async () => {
    mockFindDueQueueItems.mockResolvedValue([queueItem(1, MAX_SCROBBLE_ATTEMPTS - 1)])
    mockSubmitListens.mockRejectedValue(new ScrobbleError('still down', 500, true))

    await drainQueue(account)

    expect(mockDeleteQueueItems).toHaveBeenCalledWith([1])
    expect(mockRescheduleQueueItems).not.toHaveBeenCalled()
  })

  it('drops a rejected payload instead of retrying forever', async () => {
    mockFindDueQueueItems.mockResolvedValue([queueItem(1)])
    mockSubmitListens.mockRejectedValue(new ScrobbleError('bad payload', 400, false))

    await drainQueue(account)

    expect(mockDeleteQueueItems).toHaveBeenCalledWith([1])
    expect(mockUpdateScrobbleAccount).toHaveBeenCalledWith(1, { lastError: 'bad payload' })
  })

  it('disables the account and empties the queue when the token is rejected', async () => {
    mockFindDueQueueItems.mockResolvedValue([queueItem(1)])
    mockSubmitListens.mockRejectedValue(new ScrobbleError('invalid token', 401, false))

    await drainQueue(account)

    expect(mockDeleteAccountQueue).toHaveBeenCalledWith(1)
    expect(mockUpdateScrobbleAccount).toHaveBeenCalledWith(1, { enabled: false, lastError: 'invalid token' })
  })

  it('discards malformed payloads', async () => {
    mockFindDueQueueItems.mockResolvedValue([{ ...queueItem(1), payload: 'not json' }])

    await drainQueue(account)

    expect(mockDeleteQueueItems).toHaveBeenCalledWith([1])
    expect(mockSubmitListens).not.toHaveBeenCalled()
  })

  it('skips a disabled account', async () => {
    await drainQueue({ ...account, enabled: false })

    expect(mockFindDueQueueItems).not.toHaveBeenCalled()
  })
})

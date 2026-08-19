import { MAX_SCROBBLE_ATTEMPTS, type ListenPayload } from '@/features/scrobbling/domain'
import { ScrobbleError } from '@/features/scrobbling/providers/provider'
import { getScrobbleProvider } from '@/features/scrobbling/providers/registry'
import {
  deleteAccountQueue,
  deleteQueueItems,
  findDueQueueItems,
  rescheduleQueueItems,
  updateScrobbleAccount
} from '@/features/scrobbling/scrobbling.repository'
import type { ScrobbleAccount } from '@/generated/prisma/client'
import { decryptSecret } from '@/lib/crypto'

/** Listens sent per drain. Well under the 1000 the provider accepts per request. */
const DRAIN_BATCH_SIZE = 50

const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * 60 * MINUTE_MS

/** Exponential backoff from 1 minute, capped at a day. */
export function retryDelayMs(attempts: number): number {
  return Math.min(2 ** attempts * MINUTE_MS, DAY_MS)
}

function parsePayload(raw: string): ListenPayload | null {
  try {
    return JSON.parse(raw) as ListenPayload
  } catch {
    return null
  }
}

/**
 * Sends everything this account owes to its provider. Called opportunistically after
 * each new listen — the repo has no worker process, so nothing else drains the queue.
 * Never throws: a failing provider must not break playback.
 */
export async function drainQueue(account: ScrobbleAccount): Promise<void> {
  const provider = getScrobbleProvider(account.provider)
  if (!provider || !account.enabled) return

  const items = await findDueQueueItems(account.id, DRAIN_BATCH_SIZE)
  if (items.length === 0) return

  const malformed = items.filter(item => parsePayload(item.payload) === null)
  if (malformed.length > 0) {
    await deleteQueueItems(malformed.map(item => item.id))
  }

  const pending = items.filter(item => parsePayload(item.payload) !== null)
  if (pending.length === 0) return

  let token: string
  try {
    token = decryptSecret(account.encryptedToken)
  } catch (error) {
    await disableAccount(account, error instanceof Error ? error.message : 'Cannot decrypt token')
    return
  }

  const config = { token, apiRoot: account.apiRoot ?? provider.defaultApiRoot }
  const ids = pending.map(item => item.id)

  try {
    await provider.submitListens(
      config,
      pending.map(item => parsePayload(item.payload) as ListenPayload)
    )
    await deleteQueueItems(ids)
    if (account.lastError) {
      await updateScrobbleAccount(account.id, { lastError: null })
    }
  } catch (error) {
    await handleFailure(account, pending, ids, error)
  }
}

async function handleFailure(
  account: ScrobbleAccount,
  pending: { id: number; attempts: number }[],
  ids: number[],
  error: unknown
): Promise<void> {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(`Scrobble submission failed for ${account.provider}:`, message)

  if (error instanceof ScrobbleError && !error.retryable) {
    if (error.status === 401) {
      // The token was revoked: keep nothing queued and make the user re-enter it.
      await deleteAccountQueue(account.id)
      await disableAccount(account, message)
      return
    }
    // Rejected payload — retrying would fail forever.
    await deleteQueueItems(ids)
    await updateScrobbleAccount(account.id, { lastError: message })
    return
  }

  const exhausted = pending.filter(item => item.attempts + 1 >= MAX_SCROBBLE_ATTEMPTS).map(item => item.id)
  const retriable = pending.filter(item => item.attempts + 1 < MAX_SCROBBLE_ATTEMPTS)

  if (exhausted.length > 0) {
    await deleteQueueItems(exhausted)
  }

  await Promise.all(
    retriable.map(item =>
      rescheduleQueueItems([item.id], message, new Date(Date.now() + retryDelayMs(item.attempts + 1)))
    )
  )

  await updateScrobbleAccount(account.id, { lastError: message })
}

async function disableAccount(account: ScrobbleAccount, error: string): Promise<void> {
  await updateScrobbleAccount(account.id, { enabled: false, lastError: error })
}

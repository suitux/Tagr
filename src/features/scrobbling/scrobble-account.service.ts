import type { ScrobbleAccountPublic, ScrobbleProviderId } from '@/features/scrobbling/domain'
import { getScrobbleProvider } from '@/features/scrobbling/providers/registry'
import {
  countQueueItems,
  deleteScrobbleAccount,
  findScrobbleAccount,
  listScrobbleAccounts,
  updateScrobbleAccount,
  upsertScrobbleAccount
} from '@/features/scrobbling/scrobbling.repository'
import type { ScrobbleAccount } from '@/generated/prisma/client'
import { encryptSecret } from '@/lib/crypto'

/** Lets the route map a settings failure onto the right HTTP status. */
export class ScrobbleAccountError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ScrobbleAccountError'
  }
}

async function toPublic(account: ScrobbleAccount): Promise<ScrobbleAccountPublic> {
  return {
    provider: account.provider as ScrobbleProviderId,
    enabled: account.enabled,
    apiRoot: account.apiRoot,
    username: account.username,
    lastError: account.lastError,
    tokenSet: account.encryptedToken.length > 0,
    pendingCount: await countQueueItems(account.id)
  }
}

export async function listAccountsForUser(userId: string): Promise<ScrobbleAccountPublic[]> {
  const accounts = await listScrobbleAccounts(userId)
  return Promise.all(accounts.map(toPublic))
}

export interface SaveAccountInput {
  userId: string
  provider: ScrobbleProviderId
  enabled: boolean
  apiRoot?: string | null
  /** Omitted keeps the stored token; only sent when the user typed a new one. */
  token?: string
}

/**
 * Verifies the token against the provider before storing it encrypted. Updating only the
 * toggle or the API root reuses the stored token.
 */
export async function saveAccount({
  userId,
  provider,
  enabled,
  apiRoot,
  token
}: SaveAccountInput): Promise<ScrobbleAccountPublic> {
  const scrobbleProvider = getScrobbleProvider(provider)
  if (!scrobbleProvider) {
    throw new ScrobbleAccountError(`Unknown scrobbling provider: ${provider}`, 400)
  }

  const existing = await findScrobbleAccount(userId, provider)
  const normalizedApiRoot = apiRoot?.trim() ? apiRoot.trim().replace(/\/$/, '') : null

  if (!token) {
    if (!existing) {
      throw new ScrobbleAccountError('A token is required to enable scrobbling', 400)
    }
    const updated = await updateScrobbleAccount(existing.id, { enabled, apiRoot: normalizedApiRoot })
    return toPublic(updated)
  }

  const validation = await scrobbleProvider.validateToken({
    token,
    apiRoot: normalizedApiRoot ?? scrobbleProvider.defaultApiRoot
  })

  if (!validation.valid) {
    throw new ScrobbleAccountError('The provider rejected this token', 400)
  }

  const saved = await upsertScrobbleAccount({
    userId,
    provider,
    enabled,
    apiRoot: normalizedApiRoot,
    encryptedToken: encryptSecret(token),
    username: validation.username ?? null
  })

  return toPublic(saved)
}

export async function removeAccount(userId: string, provider: ScrobbleProviderId): Promise<void> {
  await deleteScrobbleAccount(userId, provider)
}

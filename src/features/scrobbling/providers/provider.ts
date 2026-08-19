import type { ListenPayload, ScrobbleProviderId } from '@/features/scrobbling/domain'

export interface ProviderConfig {
  token: string
  apiRoot: string
}

export interface TokenValidation {
  valid: boolean
  username?: string
}

/**
 * Contract every scrobbling service must satisfy. Adding Last.fm or Maloja means
 * writing one of these and registering it in providers/registry.ts.
 */
export interface ScrobbleProvider {
  id: ScrobbleProviderId
  defaultApiRoot: string
  validateToken(config: ProviderConfig): Promise<TokenValidation>
  submitNowPlaying(config: ProviderConfig, listen: ListenPayload): Promise<void>
  submitListens(config: ProviderConfig, listens: ListenPayload[]): Promise<void>
}

/** Carries whether the queue should retry the submission or give up. */
export class ScrobbleError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryable: boolean
  ) {
    super(message)
    this.name = 'ScrobbleError'
  }
}

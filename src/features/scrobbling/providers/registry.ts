import type { ScrobbleProviderId } from '@/features/scrobbling/domain'
import { listenBrainzProvider } from '@/features/scrobbling/providers/listenbrainz/listenbrainz.provider'
import type { ScrobbleProvider } from '@/features/scrobbling/providers/provider'

const PROVIDERS: Record<ScrobbleProviderId, ScrobbleProvider> = {
  listenbrainz: listenBrainzProvider
}

export function getScrobbleProvider(id: string): ScrobbleProvider | null {
  return PROVIDERS[id as ScrobbleProviderId] ?? null
}

export function isScrobbleProviderId(id: string): id is ScrobbleProviderId {
  return id in PROVIDERS
}

import type { ListenPayload } from '@/features/scrobbling/domain'
import {
  LISTENBRAINZ_API,
  listenBrainzApi,
  type ListenBrainzListen,
  type ListenBrainzSubmitPayload
} from '@/features/scrobbling/providers/listenbrainz/listenbrainz-api'
import { ScrobbleError, type ProviderConfig, type ScrobbleProvider } from '@/features/scrobbling/providers/provider'

const CLIENT_NAME = 'Tagr'

/** ListenBrainz caps a single request at 1000 listens. */
const MAX_LISTENS_PER_REQUEST = 1000

function toListenBrainzListen(listen: ListenPayload, includeTimestamp: boolean): ListenBrainzListen {
  return {
    ...(includeTimestamp ? { listened_at: Math.floor(new Date(listen.listenedAt).getTime() / 1000) } : {}),
    track_metadata: {
      artist_name: listen.artistName,
      track_name: listen.trackName,
      ...(listen.releaseName ? { release_name: listen.releaseName } : {}),
      additional_info: {
        ...(listen.trackNumber ? { tracknumber: listen.trackNumber } : {}),
        ...(listen.durationMs ? { duration_ms: Math.round(listen.durationMs) } : {}),
        ...(listen.recordingMbid ? { recording_mbid: listen.recordingMbid } : {}),
        ...(listen.releaseMbid ? { release_mbid: listen.releaseMbid } : {}),
        ...(listen.artistMbids?.length ? { artist_mbids: listen.artistMbids } : {}),
        media_player: CLIENT_NAME,
        submission_client: CLIENT_NAME,
        submission_client_version: process.env.APP_VERSION ?? '0.0.0'
      }
    }
  }
}

export function buildSubmitPayload(listens: ListenPayload[]): ListenBrainzSubmitPayload {
  return {
    listen_type: listens.length > 1 ? 'import' : 'single',
    payload: listens.map(listen => toListenBrainzListen(listen, true))
  }
}

export const listenBrainzProvider: ScrobbleProvider = {
  id: 'listenbrainz',
  defaultApiRoot: LISTENBRAINZ_API,

  async validateToken({ apiRoot, token }: ProviderConfig) {
    try {
      const response = await listenBrainzApi.validateToken(apiRoot, token)
      return { valid: response.valid, username: response.user_name }
    } catch (error) {
      // A rejected token answers 401 instead of `valid: false` on some deployments.
      if (error instanceof ScrobbleError && !error.retryable) {
        return { valid: false }
      }
      throw error
    }
  },

  async submitNowPlaying({ apiRoot, token }: ProviderConfig, listen: ListenPayload) {
    await listenBrainzApi.submitListens(apiRoot, token, {
      listen_type: 'playing_now',
      payload: [toListenBrainzListen(listen, false)]
    })
  },

  async submitListens({ apiRoot, token }: ProviderConfig, listens: ListenPayload[]) {
    for (let i = 0; i < listens.length; i += MAX_LISTENS_PER_REQUEST) {
      await listenBrainzApi.submitListens(
        apiRoot,
        token,
        buildSubmitPayload(listens.slice(i, i + MAX_LISTENS_PER_REQUEST))
      )
    }
  }
}

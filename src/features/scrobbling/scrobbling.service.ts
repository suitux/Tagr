import type { ListenPayload } from '@/features/scrobbling/domain'
import { getScrobbleProvider } from '@/features/scrobbling/providers/registry'
import { drainQueue } from '@/features/scrobbling/scrobble-queue.service'
import {
  createListen,
  enqueueListen,
  incrementSongPlayStats,
  listEnabledScrobbleAccounts
} from '@/features/scrobbling/scrobbling.repository'
import { findSongWithMetadata } from '@/features/songs/songs.repository'
import type { ScrobbleAccount, SongMetadata } from '@/generated/prisma/client'
import { decryptSecret } from '@/lib/crypto'

/** Native tag names other taggers use for MusicBrainz identifiers. */
const RECORDING_MBID_KEYS = ['musicbrainz_trackid', 'musicbrainz_recordingid']
const RELEASE_MBID_KEYS = ['musicbrainz_albumid', 'musicbrainz_releaseid']
const ARTIST_MBID_KEYS = ['musicbrainz_artistid', 'musicbrainz_albumartistid']

function findMetadataValue(metadata: SongMetadata[], keys: string[]): string | undefined {
  for (const key of keys) {
    const match = metadata.find(entry => entry.key.toLowerCase() === key && entry.value)
    if (match?.value) return match.value
  }
  return undefined
}

type SongWithMetadata = NonNullable<Awaited<ReturnType<typeof findSongWithMetadata>>>

function buildListenPayload(song: SongWithMetadata, listenedAt: Date): ListenPayload | null {
  if (!song.title || !song.artist) return null

  const artistMbid = findMetadataValue(song.metadata, ARTIST_MBID_KEYS)

  return {
    listenedAt: listenedAt.toISOString(),
    trackName: song.title,
    artistName: song.artist,
    releaseName: song.album ?? undefined,
    trackNumber: song.trackNumber ?? undefined,
    durationMs: song.duration ? song.duration * 1000 : undefined,
    recordingMbid: findMetadataValue(song.metadata, RECORDING_MBID_KEYS),
    releaseMbid: findMetadataValue(song.metadata, RELEASE_MBID_KEYS),
    artistMbids: artistMbid ? [artistMbid] : undefined
  }
}

function providerConfig(account: ScrobbleAccount) {
  const provider = getScrobbleProvider(account.provider)
  if (!provider) return null
  return {
    provider,
    config: { token: decryptSecret(account.encryptedToken), apiRoot: account.apiRoot ?? provider.defaultApiRoot }
  }
}

/**
 * Records a finished listen: local history and play stats always, plus a queued
 * submission for every enabled scrobbling account. Returns null if the song is gone.
 */
export async function recordListen(userId: string, songId: number, listenedAt: Date): Promise<number | null> {
  const song = await findSongWithMetadata(songId)
  if (!song) return null

  const listen = await createListen({
    userId,
    songId,
    listenedAt,
    trackName: song.title ?? song.fileName,
    artistName: song.artist,
    releaseName: song.album
  })

  await incrementSongPlayStats(songId, listenedAt)

  const payload = buildListenPayload(song, listenedAt)
  if (!payload) return listen.id

  const accounts = await listEnabledScrobbleAccounts(userId)
  for (const account of accounts) {
    await enqueueListen(account.id, payload)
    await drainQueue(account)
  }

  return listen.id
}

/**
 * Tells the providers what is playing right now. Nothing is persisted and failures are
 * swallowed — a "now playing" is worthless a minute later, so it is never queued.
 */
export async function sendNowPlaying(userId: string, songId: number): Promise<void> {
  const song = await findSongWithMetadata(songId)
  if (!song) return

  const payload = buildListenPayload(song, new Date())
  if (!payload) return

  const accounts = await listEnabledScrobbleAccounts(userId)

  await Promise.all(
    accounts.map(async account => {
      try {
        const resolved = providerConfig(account)
        if (!resolved) return
        await resolved.provider.submitNowPlaying(resolved.config, payload)
      } catch (error) {
        console.error(`Now playing failed for ${account.provider}:`, error instanceof Error ? error.message : error)
      }
    })
  )
}

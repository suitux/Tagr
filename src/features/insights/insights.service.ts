import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { SEVEN_DAYS_MS } from '@/lib/date'
import {
  INSIGHTS_ENABLED_KEY,
  INSIGHTS_ENDPOINT,
  INSIGHTS_ID_KEY,
  INSIGHTS_LAST_SENT_KEY,
  INSIGHTS_REQUEST_TIMEOUT_MS
} from './consts'
import type { InsightsData, InsightsStatus } from './domain'
import {
  countFeatureUsage,
  countRecentActivity,
  countSongsByExtension,
  getAppProperty,
  setAppProperty
} from './insights.repository'

export function getInsightsEndpoint(): string {
  return process.env.TAGR_INSIGHTS_ENDPOINT || INSIGHTS_ENDPOINT
}

/** An env var wins over the Settings toggle: `false` from either TAGR_INSIGHTS or DO_NOT_TRACK. */
export function getEnvInsightsOverride(): boolean | null {
  const flag = process.env.TAGR_INSIGHTS?.trim().toLowerCase()
  if (flag === 'false' || flag === '0' || flag === 'off') return false

  const doNotTrack = process.env.DO_NOT_TRACK?.trim().toLowerCase()
  if (doNotTrack === '1' || doNotTrack === 'true') return false

  return null
}

export async function isInsightsEnabled(): Promise<boolean> {
  const override = getEnvInsightsOverride()
  if (override !== null) return override

  return (await getAppProperty(INSIGHTS_ENABLED_KEY)) !== 'false'
}

export async function setInsightsEnabled(enabled: boolean): Promise<void> {
  await setAppProperty(INSIGHTS_ENABLED_KEY, String(enabled))
}

async function getOrCreateInsightsId(): Promise<string> {
  const existing = await getAppProperty(INSIGHTS_ID_KEY)
  if (existing) return existing

  const id = randomUUID()
  await setAppProperty(INSIGHTS_ID_KEY, id)
  return id
}

function isContainerized(): boolean {
  return existsSync('/.dockerenv') || existsSync('/run/.containerenv')
}

export async function collectInsights(): Promise<InsightsData> {
  const since = new Date(Date.now() - SEVEN_DAYS_MS)

  const [id, fileExtensions, activity, usage] = await Promise.all([
    getOrCreateInsightsId(),
    countSongsByExtension(),
    countRecentActivity(since),
    countFeatureUsage()
  ])

  return {
    schema: 1,
    id,
    version: process.env.APP_VERSION ?? '0.0.0',
    uptime: Math.round(process.uptime()),
    os: {
      platform: process.platform,
      arch: process.arch,
      containerized: isContainerized(),
      nodeVersion: process.versions.node
    },
    library: {
      songs: usage.songs,
      musicFolders: getMusicFolders().length,
      fileExtensions
    },
    users: {
      // The AUTH_USER admin lives in env, not in the users table
      total: usage.users + 1,
      listeners7d: activity.listeners
    },
    usage7d: {
      metadataEdits: activity.metadataEdits,
      editedSongs: activity.editedSongs,
      listens: activity.listens
    },
    features: {
      smartPlaylists: usage.smartPlaylists,
      savedFilters: usage.savedFilters,
      sharedLinks: usage.sharedLinks,
      scrobbleAccounts: usage.scrobbleAccounts
    }
  }
}

/** One attempt, no retries: a lost report only costs one day of one instance. */
export async function sendInsights(): Promise<void> {
  if (!(await isInsightsEnabled())) return

  const endpoint = getInsightsEndpoint()

  try {
    const data = await collectInsights()
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(INSIGHTS_REQUEST_TIMEOUT_MS)
    })

    if (!response.ok) {
      console.warn(`Insights report rejected by ${endpoint}: ${response.status}`)
      return
    }

    await setAppProperty(INSIGHTS_LAST_SENT_KEY, new Date().toISOString())
  } catch (error) {
    console.warn(`Could not send insights report to ${endpoint}:`, error instanceof Error ? error.message : error)
  }
}

export async function getInsightsStatus(): Promise<InsightsStatus> {
  const [enabled, lastSentAt, preview] = await Promise.all([
    isInsightsEnabled(),
    getAppProperty(INSIGHTS_LAST_SENT_KEY),
    collectInsights()
  ])

  return {
    enabled,
    forcedByEnv: getEnvInsightsOverride() !== null,
    endpoint: getInsightsEndpoint(),
    lastSentAt,
    preview
  }
}

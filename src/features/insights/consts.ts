/** Every published version reports here, so it lives on a domain we control rather than workers.dev. */
export const INSIGHTS_ENDPOINT = 'https://analytics.tagr.xavirincon.com/collect'

/** Same cadence as Navidrome: skip short-lived restarts, then once a day. */
export const INSIGHTS_INITIAL_DELAY_MS = 30 * 60 * 1000
export const INSIGHTS_INTERVAL_MS = 24 * 60 * 60 * 1000
export const INSIGHTS_REQUEST_TIMEOUT_MS = 10 * 1000

export const INSIGHTS_ID_KEY = 'insightsId'
export const INSIGHTS_ENABLED_KEY = 'insightsEnabled'
export const INSIGHTS_LAST_SENT_KEY = 'insightsLastSentAt'

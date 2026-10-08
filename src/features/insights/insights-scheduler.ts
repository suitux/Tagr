import { INSIGHTS_INITIAL_DELAY_MS, INSIGHTS_INTERVAL_MS } from './consts'
import { sendInsights } from './insights.service'

const globalForInsights = globalThis as unknown as { insightsSchedulerStarted?: boolean }

/**
 * Starts the daily insights report. Idempotent: register() can run more than once per process.
 * TAGR_INSIGHTS_DEBUG=1 sends the first report right away, for testing against a local server.
 */
export function startInsightsScheduler(): void {
  if (globalForInsights.insightsSchedulerStarted) return
  globalForInsights.insightsSchedulerStarted = true

  const initialDelay = process.env.TAGR_INSIGHTS_DEBUG === '1' ? 0 : INSIGHTS_INITIAL_DELAY_MS

  const initialTimer = setTimeout(() => {
    void sendInsights()
    setInterval(() => void sendInsights(), INSIGHTS_INTERVAL_MS).unref()
  }, initialDelay)
  initialTimer.unref()
}

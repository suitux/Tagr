export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NODE_ENV !== 'production' && process.env.TAGR_INSIGHTS_DEBUG !== '1') return

  const { startInsightsScheduler } = await import('@/features/insights/insights-scheduler')
  startInsightsScheduler()
}

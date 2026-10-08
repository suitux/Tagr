export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // `next build` loads instrumentation too, and there is no database to read there
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (process.env.NODE_ENV !== 'production' && process.env.TAGR_INSIGHTS_DEBUG !== '1') return

  const { startInsightsScheduler } = await import('@/features/insights/insights-scheduler')
  startInsightsScheduler()
}

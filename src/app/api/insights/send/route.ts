import { NextResponse } from 'next/server'
import { getInsightsStatus, sendInsights } from '@/features/insights/insights.service'
import { requireRole } from '@/lib/api/auth-guard'

/** "Send now" in Settings: the same report the daily timer sends, on demand. */
export async function POST() {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const result = await sendInsights()

    if (!result.sent) {
      const status = result.reason === 'failed' ? 502 : 409
      return NextResponse.json(
        { success: false, error: result.error ?? result.reason, reason: result.reason },
        { status }
      )
    }

    const insightsStatus = await getInsightsStatus()
    return NextResponse.json({ success: true, status: insightsStatus })
  } catch (error) {
    console.error('Error sending insights report:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

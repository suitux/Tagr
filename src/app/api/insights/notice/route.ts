import { NextResponse } from 'next/server'
import { getInsightsNoticeState } from '@/features/insights/insights.service'
import { requireRole } from '@/lib/api/auth-guard'

/** Cheap check behind the notice banner; GET /api/insights also builds the full preview. */
export async function GET() {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const notice = await getInsightsNoticeState()

    return NextResponse.json({ success: true, notice })
  } catch (error) {
    console.error('Error fetching insights notice state:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

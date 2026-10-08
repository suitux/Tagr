import { NextResponse } from 'next/server'
import { getInsightsStatus, setInsightsEnabled } from '@/features/insights/insights.service'
import { requireRole } from '@/lib/api/auth-guard'

export async function GET() {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const status = await getInsightsStatus()

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error fetching insights status:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const guard = await requireRole('admin')
  if (!guard.authorized) return guard.response

  try {
    const body = (await request.json()) as { enabled?: unknown }

    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'enabled must be a boolean' }, { status: 400 })
    }

    await setInsightsEnabled(body.enabled)
    const status = await getInsightsStatus()

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error updating insights setting:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

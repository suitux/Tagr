import { NextResponse } from 'next/server'
import { isTrashRetentionDays } from '@/features/trash/domain'
import { getTrashRetentionDays, setTrashRetentionDays } from '@/features/trash/trash.service'
import { requireRole } from '@/lib/api/auth-guard'

export async function GET() {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  try {
    return NextResponse.json({ success: true, settings: { retentionDays: await getTrashRetentionDays() } })
  } catch (error) {
    console.error('Error fetching trash settings:', error)
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
    const body = (await request.json()) as { retentionDays?: unknown }

    if (!isTrashRetentionDays(body.retentionDays)) {
      return NextResponse.json({ success: false, error: 'Invalid retentionDays' }, { status: 400 })
    }

    await setTrashRetentionDays(body.retentionDays)

    return NextResponse.json({ success: true, settings: { retentionDays: body.retentionDays } })
  } catch (error) {
    console.error('Error updating trash settings:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

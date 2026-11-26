import { NextResponse } from 'next/server'
import { isTrashRetentionDays } from '@/features/trash/domain'
import { countSongsExpiredUnder, getTrashSummary } from '@/features/trash/trash.service'
import { requireRole } from '@/lib/api/auth-guard'
import { getSearchParam } from '@/lib/api/search-params'

/**
 * How many songs sit in the trash and how much disk they take. With `?retentionDays=N` it also says
 * how many of them that retention would purge at once (`expired`), for the settings confirmation.
 */
export async function GET(request: Request) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const retentionDays = getSearchParam(new URL(request.url).searchParams, 'retentionDays', 'number', 0)

  try {
    const [summary, expired] = await Promise.all([
      getTrashSummary(),
      isTrashRetentionDays(retentionDays) ? countSongsExpiredUnder(retentionDays) : undefined
    ])

    return NextResponse.json({ success: true, summary, ...(expired !== undefined && { expired }) })
  } catch (error) {
    console.error('Error fetching trash summary:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

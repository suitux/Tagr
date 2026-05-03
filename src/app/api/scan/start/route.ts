import { NextResponse } from 'next/server'
import { ScanMode } from '@/features/scan/domain'
import { startScanJob } from '@/features/scan/scan-job.service'
import { requireRole } from '@/lib/api/auth-guard'

interface StartScanRequest {
  mode?: ScanMode
}

export async function POST(request: Request) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  try {
    const body = (await request.json().catch(() => ({}))) as StartScanRequest
    const mode = body.mode === 'quick' ? 'quick' : 'full'
    const job = startScanJob(mode)

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        mode: job.mode,
        startedAt: job.startedAt
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error starting scan'
      },
      { status: 400 }
    )
  }
}

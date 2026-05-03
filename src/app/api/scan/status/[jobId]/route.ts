import { NextResponse } from 'next/server'
import { getScanJob } from '@/features/scan/scan-job.service'
import { requireRole } from '@/lib/api/auth-guard'

interface RouteParams {
  params: Promise<{ jobId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { jobId } = await params
  const job = getScanJob(jobId)

  if (!job) {
    return NextResponse.json({ success: false, error: 'Scan job not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    job
  })
}

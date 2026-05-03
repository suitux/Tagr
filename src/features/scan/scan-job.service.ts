import { randomUUID } from 'crypto'
import { adaptScanResultResponse } from '@/features/metadata/adapters'
import type { ScanProgress } from '@/features/metadata/domain'
import { scanAllFoldersAndUpdateDatabase } from '@/features/metadata/metadata-scan.service'
import { ScanMode } from '@/features/scan/domain'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { analyzeDatabase, optimizeSQLite } from '@/infrastructure/prisma/optimize'
import type { ScanSummaryResult } from '@/stores/home-store'

type ScanJobStatus = 'running' | 'completed' | 'failed'

interface ScanJob {
  id: string
  mode: ScanMode
  status: ScanJobStatus
  startedAt: string
  completedAt?: string
  error?: string
  progress?: ScanProgress & { folder: string }
  result?: ScanSummaryResult
}

const MAX_COMPLETED_JOBS = 25

function getJobStore() {
  const globalRef = globalThis as typeof globalThis & {
    __scanJobs?: Map<string, ScanJob>
  }
  if (!globalRef.__scanJobs) {
    globalRef.__scanJobs = new Map<string, ScanJob>()
  }
  return globalRef.__scanJobs
}

function pruneCompletedJobs(jobs: Map<string, ScanJob>) {
  const completed = [...jobs.values()]
    .filter(job => job.status !== 'running')
    .sort((a, b) => Date.parse(b.completedAt || b.startedAt) - Date.parse(a.completedAt || a.startedAt))

  if (completed.length <= MAX_COMPLETED_JOBS) return

  for (const job of completed.slice(MAX_COMPLETED_JOBS)) {
    jobs.delete(job.id)
  }
}

export function getScanJob(jobId: string): ScanJob | null {
  return getJobStore().get(jobId) ?? null
}

export function getRunningScanJob(): ScanJob | null {
  const jobs = getJobStore()
  for (const job of jobs.values()) {
    if (job.status === 'running') return job
  }
  return null
}

export function startScanJob(mode: ScanMode): ScanJob {
  const folders = getMusicFolders()
  if (folders.length === 0) {
    throw new Error('No music folders configured. Set the MUSIC_FOLDERS environment variable.')
  }

  const runningJob = getRunningScanJob()
  if (runningJob) {
    return runningJob
  }

  const jobs = getJobStore()
  const job: ScanJob = {
    id: randomUUID(),
    mode,
    status: 'running',
    startedAt: new Date().toISOString()
  }

  jobs.set(job.id, job)

  // Run out-of-band so the HTTP request can return immediately.
  queueMicrotask(async () => {
    try {
      await optimizeSQLite()

      const scanResult = await scanAllFoldersAndUpdateDatabase(
        folders,
        progress => {
          const current = jobs.get(job.id)
          if (!current || current.status !== 'running') return
          jobs.set(job.id, { ...current, progress })
        },
        mode
      )

      await analyzeDatabase()

      const current = jobs.get(job.id)
      if (!current) return

      jobs.set(job.id, {
        ...current,
        status: 'completed',
        completedAt: new Date().toISOString(),
        result: adaptScanResultResponse(scanResult)
      })
    } catch (error) {
      const current = jobs.get(job.id)
      if (!current) return

      jobs.set(job.id, {
        ...current,
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error during scan'
      })
    } finally {
      pruneCompletedJobs(jobs)
    }
  })

  return job
}

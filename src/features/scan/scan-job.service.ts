import { randomUUID } from 'crypto'
import { adaptScanResultResponse } from '@/features/metadata/adapters'
import type { ScanProgress } from '@/features/metadata/domain'
import { scanAllFoldersAndUpdateDatabase } from '@/features/metadata/metadata-scan.service'
import { ScanMode } from '@/features/scan/domain'
import { getMusicFolders } from '@/features/songs/song-file-helpers'
import { analyzeDatabase, optimizeSQLite } from '@/infrastructure/prisma/optimize'
import type { ScanSummaryResult } from '@/stores/home-store'

export type ScanJobStatus = 'running' | 'completed' | 'failed'

export interface ScanJob {
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

/**
 * Keep the job store on globalThis so it survives Next.js module re-evaluation
 * (dev hot reload, route isolation) and is shared across the /scan/* routes.
 */
function getJobStore(): Map<string, ScanJob> {
  const globalRef = globalThis as typeof globalThis & {
    __scanJobs?: Map<string, ScanJob>
  }
  if (!globalRef.__scanJobs) {
    globalRef.__scanJobs = new Map<string, ScanJob>()
  }
  return globalRef.__scanJobs
}

function pruneCompletedJobs(jobs: Map<string, ScanJob>): void {
  const completed = [...jobs.values()]
    .filter(job => job.status !== 'running')
    .sort((a, b) => Date.parse(b.completedAt || b.startedAt) - Date.parse(a.completedAt || a.startedAt))

  for (const job of completed.slice(MAX_COMPLETED_JOBS)) {
    jobs.delete(job.id)
  }
}

export function getScanJob(jobId: string): ScanJob | null {
  return getJobStore().get(jobId) ?? null
}

export function getRunningScanJob(): ScanJob | null {
  for (const job of getJobStore().values()) {
    if (job.status === 'running') return job
  }
  return null
}

/**
 * Starts a library scan in the background and returns immediately. The scan runs
 * detached from the HTTP request so a slow scan can never time out the proxy
 * (issue #22). Progress and the final result are read back via getScanJob().
 */
export function startScanJob(mode: ScanMode): ScanJob {
  const folders = getMusicFolders()
  if (folders.length === 0) {
    throw new Error('No music folders configured. Set the MUSIC_FOLDERS environment variable.')
  }

  const running = getRunningScanJob()
  if (running) return running

  const jobs = getJobStore()
  const job: ScanJob = {
    id: randomUUID(),
    mode,
    status: 'running',
    startedAt: new Date().toISOString()
  }
  jobs.set(job.id, job)

  // Fire-and-forget: do NOT await. Errors are captured onto the job.
  void runScan(job, folders, mode)

  return job
}

async function runScan(job: ScanJob, folders: string[], mode: ScanMode): Promise<void> {
  try {
    await optimizeSQLite()

    const result = await scanAllFoldersAndUpdateDatabase(
      folders,
      progress => {
        job.progress = progress
      },
      mode
    )

    await analyzeDatabase()

    job.result = adaptScanResultResponse(result)
    job.status = 'completed'
  } catch (error) {
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : 'Unknown error during scan'
    console.error('Error during scan:', error)
  } finally {
    job.completedAt = new Date().toISOString()
    pruneCompletedJobs(getJobStore())
  }
}

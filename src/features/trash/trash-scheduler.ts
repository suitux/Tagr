import { runTrashMaintenance } from './trash.service'

/** Late enough not to compete with a scan started at boot, early enough for containers restarted daily. */
const TRASH_INITIAL_DELAY_MS = 5 * 60 * 1000
const TRASH_INTERVAL_MS = 24 * 60 * 60 * 1000

const globalForTrash = globalThis as unknown as { trashSchedulerStarted?: boolean }

/**
 * Empties the trash of what expired once a day, so "deleted after N days" holds even when nobody
 * deletes anything else. Idempotent: register() can run more than once per process.
 */
export function startTrashScheduler(): void {
  if (globalForTrash.trashSchedulerStarted) return
  globalForTrash.trashSchedulerStarted = true

  const initialTimer = setTimeout(() => {
    void runTrashMaintenance()
    setInterval(() => void runTrashMaintenance(), TRASH_INTERVAL_MS).unref()
  }, TRASH_INITIAL_DELAY_MS)
  initialTimer.unref()
}

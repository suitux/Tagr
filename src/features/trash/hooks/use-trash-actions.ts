'use client'

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import type { BulkTarget } from '@/features/songs/bulk-target'
import { useQueryClient } from '@tanstack/react-query'
import { DEFAULT_TRASH_RETENTION_DAYS, type TrashOperationResult } from '../domain'
import { type TrashOperation, useTrashOperation } from './use-trash-operation'
import { trashSettingsQueryOptions } from './use-trash-settings'

/** "Empty the trash" is a `delete` without a target. */
type TrashAction = TrashOperation | 'empty'

const OPERATION_BY_ACTION: Record<TrashAction, TrashOperation> = {
  trash: 'trash',
  restore: 'restore',
  delete: 'delete',
  empty: 'delete'
}

/** Long enough to notice a slip and take it back; after that the song is restored from the trash view. */
const UNDO_TOAST_MS = 8000
const FAILURE_TOAST_MS = 15000
const LISTED_FAILURES = 5

type Failure = Extract<TrashOperationResult, { ok: false }>

/**
 * Runs and reports a trash operation. Moving to the trash and restoring are reversible, so they can run
 * straight away (the former with an "Undo"); what removes files for good always asks first. Uses
 * `mutateAsync` so the outcome is still reported when the component that started it unmounts — the
 * songs it showed usually leave the listing.
 */
export function useTrashActions() {
  const t = useTranslations('trash')
  const tCommon = useTranslations('common')
  const { confirm } = useAlertDialog()
  const queryClient = useQueryClient()
  const { mutateAsync } = useTrashOperation()

  const describeFailures = (failures: Failure[]) => {
    const lines = failures
      .slice(0, LISTED_FAILURES)
      .map(failure => `${failure.fileName ?? `#${failure.songId}`}: ${t(`errors.${failure.code}`)}`)

    const hidden = failures.length - lines.length
    if (hidden > 0) lines.push(t('result.moreFailures', { count: hidden }))

    return lines.join('\n')
  }

  const run = async (action: TrashAction, target?: BulkTarget) => {
    const toastId = toast.loading(t('progress.running'))

    try {
      const { results } = await mutateAsync({
        operation: OPERATION_BY_ACTION[action],
        target,
        onProgress: ({ completed, total }) => toast.loading(t('progress.count', { completed, total }), { id: toastId })
      })

      const failures = results.filter((result): result is Failure => !result.ok)
      const succeededIds = results.filter(result => result.ok).map(result => result.songId)

      const undo =
        action === 'trash' && succeededIds.length > 0
          ? { label: t('actions.undo'), onClick: () => void run('restore', { mode: 'ids', songIds: succeededIds }) }
          : undefined

      if (failures.length === 0) {
        toast.success(t(`result.${action}`, { count: succeededIds.length }), {
          id: toastId,
          action: undo,
          duration: undo ? UNDO_TOAST_MS : undefined
        })
        return
      }

      const report = succeededIds.length === 0 ? toast.error : toast.warning
      report(t('result.partial', { ok: succeededIds.length, failed: failures.length }), {
        id: toastId,
        description: describeFailures(failures),
        descriptionClassName: 'whitespace-pre-line',
        action: undo,
        duration: FAILURE_TOAST_MS
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon('error'), { id: toastId })
    }
  }

  const confirmAndRun = (action: 'delete' | 'empty', count: number, target?: BulkTarget) => {
    confirm({
      title: t(`confirm.${action}.title`, { count }),
      description: t(`confirm.${action}.description`, { count }),
      cancel: { label: tCommon('cancel') },
      action: {
        label: t(`actions.${action}`),
        variant: 'destructive',
        onClick: () => void run(action, target)
      }
    })
  }

  /** The dialog says how long the songs stay recoverable, so it needs the retention setting. */
  const confirmMoveToTrash = async (target: BulkTarget, count: number) => {
    const settings = await queryClient.ensureQueryData(trashSettingsQueryOptions).catch(() => null)
    const days = settings?.retentionDays ?? DEFAULT_TRASH_RETENTION_DAYS

    confirm({
      title: t('confirm.trash.title', { count }),
      description: t('confirm.trash.description', { count, days }),
      cancel: { label: tCommon('cancel') },
      action: { label: t('actions.trash'), variant: 'destructive', onClick: () => void run('trash', target) }
    })
  }

  return {
    moveToTrash: (target: BulkTarget) => void run('trash', target),
    /** For entry points where a slip is easy, like a context menu item next to harmless ones. */
    confirmMoveToTrash: (target: BulkTarget, count: number) => void confirmMoveToTrash(target, count),
    restore: (target: BulkTarget) => void run('restore', target),
    deletePermanently: (target: BulkTarget, count: number) => confirmAndRun('delete', count, target),
    emptyTrash: (count: number) => confirmAndRun('empty', count)
  }
}

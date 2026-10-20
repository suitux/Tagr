'use client'

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import type { BulkTarget } from '@/features/songs/bulk-target'
import { useQueryClient } from '@tanstack/react-query'
import { DEFAULT_TRASH_RETENTION_DAYS } from '../domain'
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

/**
 * Confirms, runs and reports a trash operation. Uses `mutateAsync` so the outcome is still reported when the
 * component that started it unmounts — the songs it showed usually leave the listing.
 */
export function useTrashActions() {
  const t = useTranslations('trash')
  const tCommon = useTranslations('common')
  const { confirm } = useAlertDialog()
  const queryClient = useQueryClient()
  const { mutateAsync } = useTrashOperation()

  const run = async (action: TrashAction, target?: BulkTarget) => {
    const toastId = toast.loading(t('progress.running'))

    try {
      const { results } = await mutateAsync({
        operation: OPERATION_BY_ACTION[action],
        target,
        onProgress: ({ completed, total }) => toast.loading(t('progress.count', { completed, total }), { id: toastId })
      })

      const failures = results.filter(result => !result.ok)
      const ok = results.length - failures.length

      if (failures.length === 0) {
        toast.success(t(`result.${action}`, { count: ok }), { id: toastId })
      } else {
        const firstError = failures[0].ok ? '' : failures[0].error
        toast.warning(t('result.partial', { ok, failed: failures.length, error: firstError }), {
          id: toastId,
          duration: 15000
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon('error'), { id: toastId })
    }
  }

  const request = async (action: TrashAction, count: number, target?: BulkTarget) => {
    const settings = await queryClient.ensureQueryData(trashSettingsQueryOptions).catch(() => null)
    const days = settings?.retentionDays ?? DEFAULT_TRASH_RETENTION_DAYS

    confirm({
      title: t(`confirm.${action}.title`, { count }),
      description: t(`confirm.${action}.description`, { count, days }),
      cancel: { label: tCommon('cancel') },
      action: {
        label: t(`actions.${action}`),
        variant: action === 'restore' ? 'default' : 'destructive',
        onClick: () => void run(action, target)
      }
    })
  }

  return {
    moveToTrash: (target: BulkTarget, count: number) => void request('trash', count, target),
    restore: (target: BulkTarget, count: number) => void request('restore', count, target),
    deletePermanently: (target: BulkTarget, count: number) => void request('delete', count, target),
    emptyTrash: (count: number) => void request('empty', count)
  }
}

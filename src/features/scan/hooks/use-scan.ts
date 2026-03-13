import { toast } from 'sonner'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { ScanMode } from '@/features/scan/domain'
import { api } from '@/lib/axios'
import type { ScanSummaryResult } from '@/stores/home-store'
import { useHomeStore } from '@/stores/home-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ScanResponse {
  success: boolean
  error?: string
  result?: ScanSummaryResult
}

async function scanDatabase(mode?: ScanMode): Promise<ScanResponse> {
  const { data } = await api.get<ScanResponse>('/scan', { params: { mode } })
  return data
}

export function useScan() {
  const queryClient = useQueryClient()
  const t = useTranslations('folders')
  const tCommon = useTranslations('common')
  const { setScanLastResult, setScanSummaryOpen } = useHomeStore()
  const { confirm } = useAlertDialog()

  const mutation = useMutation({
    mutationFn: ({ mode }: { mode?: ScanMode } = {}) => scanDatabase(mode),
    onMutate: () => {
      return { toastId: toast.loading(t('scanning')) }
    },
    onSuccess: (data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })

      if (data.result) {
        setScanLastResult(data.result)
        const { added, updated, deleted, skipped, errors } = data.result
        const totalScanned = added.count + updated.count + errors.length
        toast.success(t('scanCompleted'), {
          id: context?.toastId,
          description: `${totalScanned} ${t('filesScanned')} • ${added.count} ${t('added')} • ${updated.count} ${t('updated')} • ${deleted.count} ${t('deleted')}${skipped.count > 0 ? ` • ${skipped.count} ${t('skipped')}` : ''}${errors.length > 0 ? ` • ${errors.length} ${t('errors')}` : ''}`,
          action: {
            label: t('viewDetails'),
            onClick: () => setScanSummaryOpen(true)
          },
          dismissible: true,
          duration: 30000,
          closeButton: true
        })
      } else {
        toast.success(t('scanCompleted'), { id: context?.toastId })
      }
    },
    onError: (error, _variables, context) => {
      toast.error(t('scanFailed'), {
        id: context?.toastId,
        description: error instanceof Error ? error.message : t('unknownError')
      })
    }
  })

  const confirmQuickScan = useCallback(() => {
    confirm({
      title: t('quickScanConfirmTitle'),
      description: t('quickScanConfirmDescription'),
      cancel: { label: tCommon('cancel') },
      action: { label: t('quickScan'), onClick: () => mutation.mutate({ mode: 'quick' }) }
    })
  }, [confirm, t, tCommon, mutation])

  const confirmFullScan = useCallback(() => {
    confirm({
      title: t('fullScanConfirmTitle'),
      description: t('fullScanConfirmDescription'),
      cancel: { label: tCommon('cancel') },
      action: { label: t('fullScan'), onClick: () => mutation.mutate({ mode: 'full' }) }
    })
  }, [confirm, t, tCommon, mutation])

  return {
    ...mutation,
    confirmQuickScan,
    confirmFullScan
  }
}

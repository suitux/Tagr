import { toast } from 'sonner'
import { useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { ScanMode } from '@/features/scan/domain'
import { invalidateSongListings } from '@/features/songs/hooks/bulk-cache-sync'
import { api } from '@/lib/axios'
import type { ScanSummaryResult } from '@/stores/home-store'
import { useHomeStore } from '@/stores/home-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ScanResponse {
  success: boolean
  error?: string
  result?: ScanSummaryResult
}

interface ScanStartResponse {
  success: boolean
  error?: string
  job?: {
    id: string
    status: 'running' | 'completed' | 'failed'
  }
}

interface ScanProgress {
  current: number
  total: number
}

interface ScanStatusResponse {
  success: boolean
  error?: string
  job?: {
    id: string
    status: 'running' | 'completed' | 'failed'
    error?: string
    progress?: ScanProgress
    result?: ScanSummaryResult
  }
}

const SCAN_POLL_INTERVAL_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Scans run as a background job server-side (issue #22): start it, then poll for
// completion so a long scan can never time out the request/proxy.
async function scanDatabase(mode?: ScanMode, onProgress?: (progress: ScanProgress) => void): Promise<ScanResponse> {
  const start = await api.post<ScanStartResponse>('/scan/start', { mode })

  if (!start.data.success || !start.data.job?.id) {
    throw new Error(start.data.error || 'Failed to start scan')
  }

  const jobId = start.data.job.id

  for (;;) {
    await sleep(SCAN_POLL_INTERVAL_MS)
    const { data } = await api.get<ScanStatusResponse>(`/scan/status/${jobId}`)

    if (!data.success || !data.job) {
      throw new Error(data.error || 'Failed to read scan status')
    }

    if (data.job.progress) onProgress?.(data.job.progress)

    if (data.job.status === 'running') continue

    if (data.job.status === 'failed') {
      throw new Error(data.job.error || 'Scan failed')
    }

    return { success: true, result: data.job.result }
  }
}

export function useScan() {
  const queryClient = useQueryClient()
  const t = useTranslations('folders')
  const tCommon = useTranslations('common')
  const { setScanLastResult, setScanSummaryOpen } = useHomeStore()
  const { confirm } = useAlertDialog()
  const toastIdRef = useRef<string | number | undefined>(undefined)

  const mutation = useMutation({
    mutationFn: ({ mode }: { mode?: ScanMode } = {}) =>
      scanDatabase(mode, ({ current, total }) => {
        if (toastIdRef.current === undefined) return
        toast.loading(t('scanningProgress', { current, total }), { id: toastIdRef.current })
      }),
    onMutate: () => {
      const toastId = toast.loading(t('scanning'))
      toastIdRef.current = toastId
      return { toastId }
    },
    onSuccess: (data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      invalidateSongListings(queryClient)

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

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/axios'
import { useHomeStore } from '@/stores/home-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ScanResponse {
  success: boolean
  error?: string
  result?: {
    totalAdded: number
    totalDeleted: number
    totalSkipped: number
    totalErrors: number
    totalScanned: number
    totalUpdated: number
    addedFiles: string[]
    updatedFiles: string[]
    deletedFiles: string[]
    skippedFiles: string[]
    errors: Array<{ path: string; error: string }>
  }
}

async function scanDatabase(mode?: 'full' | 'quick'): Promise<ScanResponse> {
  const { data } = await api.get<ScanResponse>('/scan', { params: { mode } })
  return data
}

export function useScan() {
  const queryClient = useQueryClient()
  const t = useTranslations('folders')
  const { setScanLastResult, setScanSummaryOpen } = useHomeStore()

  return useMutation({
    mutationFn: ({ mode }: { mode?: 'full' | 'quick' } = {}) => scanDatabase(mode),
    onMutate: () => {
      return { toastId: toast.loading(t('scanning')) }
    },
    onSuccess: (data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })

      if (data.result) {
        setScanLastResult(data.result)
        const { totalScanned, totalAdded, totalUpdated, totalDeleted, totalSkipped, totalErrors } = data.result
        toast.success(t('scanCompleted'), {
          id: context?.toastId,
          description: `${totalScanned} ${t('filesScanned')} • ${totalAdded} ${t('added')} • ${totalUpdated} ${t('updated')} • ${totalDeleted} ${t('deleted')}${totalSkipped > 0 ? ` • ${totalSkipped} ${t('skipped')}` : ''}${totalErrors > 0 ? ` • ${totalErrors} ${t('errors')}` : ''}`,
          action: {
            label: t('viewDetails'),
            onClick: () => setScanSummaryOpen(true)
          },
          dismissible: true,
          duration: 30000
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
}

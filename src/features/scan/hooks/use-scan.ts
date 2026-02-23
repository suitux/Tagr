import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ScanResult {
  totalAdded: number
  totalDeleted: number
  totalErrors: number
  totalScanned: number
  totalUpdated: number
  errors: number
}

interface ScanResponse {
  success: boolean
  error?: string
  result?: ScanResult
}

async function scanDatabase(): Promise<ScanResponse> {
  const { data } = await api.get<ScanResponse>('/scan')
  return data
}

export function useScan() {
  const queryClient = useQueryClient()
  const t = useTranslations('folders')

  return useMutation({
    mutationFn: scanDatabase,
    onMutate: () => {
      return { toastId: toast.loading(t('scanning')) }
    },
    onSuccess: (data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })

      if (data.result) {
        const { totalScanned, totalAdded, totalUpdated, totalDeleted, totalErrors } = data.result
        toast.success(t('scanCompleted'), {
          id: context?.toastId,
          description: `${totalScanned} ${t('filesScanned')} • ${totalAdded} ${t('added')} • ${totalUpdated} ${t('updated')} • ${totalDeleted} ${t('deleted')}${totalErrors > 0 ? ` • ${totalErrors} ${t('errors')}` : ''}`
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

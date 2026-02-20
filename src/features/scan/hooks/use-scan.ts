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

  return useMutation({
    mutationFn: scanDatabase,
    onSuccess: () => {
      // Invalidar las queries de folders y songs para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    }
  })
}

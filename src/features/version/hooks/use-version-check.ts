'use client'

import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface VersionResponse {
  current: string
  latest: string | null
  updateAvailable: boolean
  releaseUrl: string | null
}

async function fetchVersion(): Promise<VersionResponse> {
  const response = await api.get<VersionResponse>('/version')
  return response.data
}

export function useVersionCheck() {
  const { data: versionData } = useQuery({
    queryKey: ['version'],
    queryFn: fetchVersion
  })

  const { data: dismissedVersion } = useConfig<string | null>({
    key: 'dismissedVersion',
    defaultData: null
  })

  const { mutate: updateConfig } = useUpdateConfig({ parser: v => v ?? null })

  const showNotification =
    !!versionData?.updateAvailable && !!versionData.latest && versionData.latest !== dismissedVersion

  const dismiss = () => {
    if (versionData?.latest) {
      updateConfig({ key: 'dismissedVersion', value: versionData.latest ?? null })
    }
  }

  return {
    showNotification,
    latest: versionData?.latest ?? null,
    releaseUrl: versionData?.releaseUrl ?? null,
    dismiss
  }
}

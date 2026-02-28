'use client'

import { ConfigKey } from '@/features/config/domain'
import { api } from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

export interface ConfigSuccessResponse {
  success: true
  value: string | null
}

export interface ConfigErrorResponse {
  success: false
  error: string
}

export type ConfigResponse = ConfigSuccessResponse | ConfigErrorResponse

async function fetchConfig(key: string): Promise<string | null> {
  const response = await api.get<ConfigResponse>('/config', { params: { key } })

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.value
}

interface UseConfigParams<T> {
  key: ConfigKey
  parser?: (value: string | null) => T
  defaultData?: T
}

export const getConfigQueryKey = (key: ConfigKey) => ['config', key]

export function useConfig<T>({ key, parser = v => v as unknown as T, defaultData }: UseConfigParams<T>) {
  return useQuery({
    queryKey: getConfigQueryKey(key),
    queryFn: async () => {
      const data = await fetchConfig(key)

      if (!data) {
        return defaultData ?? null
      }

      return parser(data)
    }
  })
}

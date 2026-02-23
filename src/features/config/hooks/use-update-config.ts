import { ConfigKey } from '@/features/config/domain'
import { getConfigQueryKey } from '@/features/config/hooks/use-config'
import { api } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export interface UpsertSuccessResponse {
  success: true
  key: string
  value: string
}

export interface UpsertErrorResponse {
  success: false
  error: string
}

export type UpsertResponse = UpsertSuccessResponse | UpsertErrorResponse

async function upsertConfig({ key, value }: { key: ConfigKey; value: string }): Promise<string> {
  const response = await api.put<UpsertResponse>('/config', { key, value })

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.value
}

export function useUpdateConfig(parser: (value: string | null) => unknown) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upsertConfig,
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: getConfigQueryKey(key) })
      const previous = queryClient.getQueryData<string | null>(getConfigQueryKey(key))
      queryClient.setQueryData(getConfigQueryKey(key), parser(value))
      return { previous, key }
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(getConfigQueryKey(context.key), context.previous)
      }
    }
  })
}

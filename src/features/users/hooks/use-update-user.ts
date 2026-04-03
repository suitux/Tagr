import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UpdateUserParams {
  id: number
  username?: string
  password?: string
  role?: string
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...params }: UpdateUserParams) => {
      const { data } = await api.patch(`/users/${id}`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

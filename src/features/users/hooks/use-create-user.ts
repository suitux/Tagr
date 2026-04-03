import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface CreateUserParams {
  username: string
  password: string
  role: string
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateUserParams) => {
      const { data } = await api.post('/users', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

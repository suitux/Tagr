import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UserPublic } from '../domain'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<{ success: true; users: UserPublic[] }>('/users')
      return data.users
    },
    enabled
  })
}

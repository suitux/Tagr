'use client'

import { ShareLink } from '@/features/share/domain'
import { api } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'

interface CreateShareParams {
  songId: number
  expiresInSeconds: number
}

interface CreateShareResponse {
  success: true
  share: ShareLink
}

interface CreateShareError {
  success: false
  error: string
}

type CreateShareResult = CreateShareResponse | CreateShareError

async function createShare({ songId, expiresInSeconds }: CreateShareParams): Promise<ShareLink> {
  const response = await api.post<CreateShareResult>('/share', { songId, expiresInSeconds })

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.share
}

export function useCreateShare() {
  return useMutation({ mutationFn: createShare })
}

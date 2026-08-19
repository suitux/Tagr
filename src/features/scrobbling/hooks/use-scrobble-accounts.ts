'use client'

import type { ScrobbleAccountPublic, ScrobbleProviderId } from '@/features/scrobbling/domain'
import { api } from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface AccountsSuccessResponse {
  success: true
  accounts: ScrobbleAccountPublic[]
}

interface AccountsErrorResponse {
  success: false
  error: string
}

type AccountsResponse = AccountsSuccessResponse | AccountsErrorResponse

interface SaveAccountSuccessResponse {
  success: true
  account: ScrobbleAccountPublic | null
}

type SaveAccountResponse = SaveAccountSuccessResponse | AccountsErrorResponse

export const SCROBBLE_ACCOUNTS_QUERY_KEY = ['scrobble-accounts']

async function fetchAccounts(): Promise<ScrobbleAccountPublic[]> {
  const response = await api.get<AccountsResponse>('/scrobble/accounts')

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.accounts
}

export function useScrobbleAccounts() {
  return useQuery({
    queryKey: SCROBBLE_ACCOUNTS_QUERY_KEY,
    queryFn: fetchAccounts
  })
}

export interface SaveScrobbleAccountInput {
  provider: ScrobbleProviderId
  enabled: boolean
  apiRoot?: string | null
  /** Omit to keep the stored token, `null` to delete the account. */
  token?: string | null
}

async function saveAccount(input: SaveScrobbleAccountInput): Promise<ScrobbleAccountPublic | null> {
  const response = await api.put<SaveAccountResponse>('/scrobble/accounts', input)

  if (!response.data.success) {
    throw new Error(response.data.error)
  }

  return response.data.account
}

export function useSaveScrobbleAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCROBBLE_ACCOUNTS_QUERY_KEY })
    }
  })
}

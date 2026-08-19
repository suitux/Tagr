import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { ScrobbleAccountPublic } from '@/features/scrobbling/domain'
import { ScrobbleError } from '@/features/scrobbling/providers/provider'
import { isScrobbleProviderId } from '@/features/scrobbling/providers/registry'
import {
  listAccountsForUser,
  removeAccount,
  saveAccount,
  ScrobbleAccountError
} from '@/features/scrobbling/scrobble-account.service'

interface AccountsSuccessResponse {
  success: true
  accounts: ScrobbleAccountPublic[]
}

interface AccountsErrorResponse {
  success: false
  error: string
}

type AccountsResponse = AccountsSuccessResponse | AccountsErrorResponse

export async function GET(): Promise<NextResponse<AccountsResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accounts = await listAccountsForUser(userId)
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error('Error fetching scrobble accounts:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

interface SaveAccountBody {
  provider: string
  enabled: boolean
  apiRoot?: string | null
  /** Only sent when the user typed a new token; `null` removes the account. */
  token?: string | null
}

interface SaveAccountSuccessResponse {
  success: true
  account: ScrobbleAccountPublic | null
}

type SaveAccountResponse = SaveAccountSuccessResponse | AccountsErrorResponse

export async function PUT(request: NextRequest): Promise<NextResponse<SaveAccountResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as SaveAccountBody

    if (!isScrobbleProviderId(body.provider) || typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Body must include a known "provider" and "enabled" (boolean)' },
        { status: 400 }
      )
    }

    if (body.token === null) {
      await removeAccount(userId, body.provider)
      return NextResponse.json({ success: true, account: null })
    }

    const account = await saveAccount({
      userId,
      provider: body.provider,
      enabled: body.enabled,
      apiRoot: body.apiRoot,
      token: body.token
    })

    return NextResponse.json({ success: true, account })
  } catch (error) {
    if (error instanceof ScrobbleAccountError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    if (error instanceof ScrobbleError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 })
    }
    console.error('Error saving scrobble account:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

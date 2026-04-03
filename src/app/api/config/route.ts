import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requireRole } from '@/lib/api/auth-guard'
import { getConfigValue, upsertConfigValue } from '@/features/config/service'

interface ConfigSuccessResponse {
  success: true
  value: string | null
}

interface ConfigErrorResponse {
  success: false
  error: string
}

type ConfigResponse = ConfigSuccessResponse | ConfigErrorResponse

export async function GET(request: NextRequest): Promise<NextResponse<ConfigResponse>> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const key = request.nextUrl.searchParams.get('key')

  if (!key) {
    return NextResponse.json({ success: false, error: 'Missing "key" query parameter' }, { status: 400 })
  }

  try {
    const value = await getConfigValue(session.user.id, key)
    return NextResponse.json({ success: true, value })
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

interface UpsertBody {
  key: string
  value: string
}

interface UpsertSuccessResponse {
  success: true
  key: string
  value: string
}

type UpsertResponse = UpsertSuccessResponse | ConfigErrorResponse

export async function PUT(request: NextRequest): Promise<NextResponse<UpsertResponse>> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const userId = guard.session.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as UpsertBody

    if (!body.key || typeof body.value !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Body must include "key" (string) and "value" (string)' },
        { status: 400 }
      )
    }

    const config = await upsertConfigValue(userId, body.key, body.value)

    return NextResponse.json({ success: true, key: config.key, value: config.value })
  } catch (error) {
    console.error('Error upserting config:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

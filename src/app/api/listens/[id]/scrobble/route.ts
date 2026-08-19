import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { scrobbleListen } from '@/features/scrobbling/scrobbling.service'

interface ScrobbleSuccessResponse {
  success: true
}

interface ScrobbleErrorResponse {
  success: false
  error: string
}

type ScrobbleResponse = ScrobbleSuccessResponse | ScrobbleErrorResponse

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ScrobbleResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const listenId = Number.parseInt(id, 10)

  if (!Number.isFinite(listenId)) {
    return NextResponse.json({ success: false, error: 'Invalid listen id' }, { status: 400 })
  }

  try {
    const submitted = await scrobbleListen(userId, listenId)

    if (!submitted) {
      return NextResponse.json({ success: false, error: 'Listen not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error scrobbling listen:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

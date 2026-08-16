import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { ListenWithSong } from '@/features/scrobbling/domain'
import { countListens, listRecentListens } from '@/features/scrobbling/scrobbling.repository'
import { recordListen } from '@/features/scrobbling/scrobbling.service'
import { getSearchParam } from '@/lib/api/search-params'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

interface ListensSuccessResponse {
  success: true
  totalListens: number
  listens: ListenWithSong[]
}

interface ListensErrorResponse {
  success: false
  error: string
}

type ListensResponse = ListensSuccessResponse | ListensErrorResponse

export async function GET(request: NextRequest): Promise<NextResponse<ListensResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(getSearchParam(searchParams, 'limit', 'number', DEFAULT_LIMIT), MAX_LIMIT)
  const offset = getSearchParam(searchParams, 'offset', 'number', 0)

  try {
    const [listens, totalListens] = await Promise.all([listRecentListens(userId, limit, offset), countListens(userId)])
    return NextResponse.json({ success: true, totalListens, listens })
  } catch (error) {
    console.error('Error fetching listens:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

interface CreateListenBody {
  songId: number
  listenedAt: string
}

interface CreateListenSuccessResponse {
  success: true
  listenId: number
}

type CreateListenResponse = CreateListenSuccessResponse | ListensErrorResponse

export async function POST(request: NextRequest): Promise<NextResponse<CreateListenResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as CreateListenBody
    const listenedAt = new Date(body.listenedAt)

    if (typeof body.songId !== 'number' || Number.isNaN(listenedAt.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Body must include "songId" (number) and "listenedAt" (ISO date)' },
        { status: 400 }
      )
    }

    const listenId = await recordListen(userId, body.songId, listenedAt)

    if (listenId === null) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, listenId })
  } catch (error) {
    console.error('Error recording listen:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

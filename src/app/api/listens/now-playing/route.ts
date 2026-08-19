import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sendNowPlaying } from '@/features/scrobbling/scrobbling.service'

interface NowPlayingBody {
  songId: number
}

interface NowPlayingSuccessResponse {
  success: true
}

interface NowPlayingErrorResponse {
  success: false
  error: string
}

type NowPlayingResponse = NowPlayingSuccessResponse | NowPlayingErrorResponse

export async function POST(request: NextRequest): Promise<NextResponse<NowPlayingResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as NowPlayingBody

    if (typeof body.songId !== 'number') {
      return NextResponse.json({ success: false, error: 'Body must include "songId" (number)' }, { status: 400 })
    }

    await sendNowPlaying(userId, body.songId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending now playing:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

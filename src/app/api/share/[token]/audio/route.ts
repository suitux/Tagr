import { NextResponse } from 'next/server'
import { streamAudioFile } from '@/features/songs/audio-stream'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { token } = await params

  try {
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: { song: { select: { filePath: true } } }
    })

    if (!sharedLink) {
      return NextResponse.json({ success: false, error: 'Share link not found' }, { status: 404 })
    }

    if (new Date() > sharedLink.expiresAt) {
      return NextResponse.json({ success: false, error: 'Share link has expired' }, { status: 410 })
    }

    return streamAudioFile(sharedLink.song.filePath, request.headers.get('range'))
  } catch (error) {
    console.error('Error streaming shared audio:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

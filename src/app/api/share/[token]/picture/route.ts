import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { token } = await params

  try {
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: { song: { select: { id: true } } }
    })

    if (!sharedLink) {
      return NextResponse.json({ success: false, error: 'Share link not found' }, { status: 404 })
    }

    if (new Date() > sharedLink.expiresAt) {
      return NextResponse.json({ success: false, error: 'Share link has expired' }, { status: 410 })
    }

    const picture = await prisma.songPicture.findFirst({
      where: { songId: sharedLink.song.id },
      select: { data: true, format: true }
    })

    if (!picture || !picture.data) {
      return NextResponse.json({ success: false, error: 'No picture found' }, { status: 404 })
    }

    const contentType = picture.format || 'image/jpeg'

    return new NextResponse(picture.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error fetching shared picture:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

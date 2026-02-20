import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const picture = await prisma.songPicture.findFirst({
      where: { songId },
      select: {
        data: true,
        format: true,
        type: true
      }
    })

    if (!picture || !picture.data) {
      return NextResponse.json({ success: false, error: 'No picture found for this song' }, { status: 404 })
    }

    // Determinar el content type basado en el formato
    const contentType = picture.format || 'image/jpeg'

    return new NextResponse(picture.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Error fetching song picture:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

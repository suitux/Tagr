import { NextResponse } from 'next/server'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }

    const song = await prisma.song.findUnique({ where: { id: songId } })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await writePictureToFile(song.filePath, buffer, file.type)
    const updatedSong = await rescanSongFileAndSaveIntoDb(songId)

    return NextResponse.json({ success: true, song: updatedSong })
  } catch (error) {
    console.error('Error updating song picture:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
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

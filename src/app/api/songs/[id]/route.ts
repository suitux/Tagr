import { NextResponse } from 'next/server'
import { Song } from '@/features/songs/domain'
import { prisma } from '@/lib/db/client'
import { SongMetadataUpdate, writeMetadataToFile } from '@/lib/db/metadata-writer'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

interface UpdateSongSuccessResponse {
  success: true
  song: Song
}

interface UpdateSongErrorResponse {
  success: false
  error: string
}

type UpdateSongResponse = UpdateSongSuccessResponse | UpdateSongErrorResponse

interface GetSongSuccessResponse {
  success: true
  song: Song
}

interface GetSongErrorResponse {
  success: false
  error: string
}

type GetSongResponse = GetSongSuccessResponse | GetSongErrorResponse

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse<GetSongResponse>> {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await prisma.song.findUnique({
      where: { id: songId }
    })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      song
    })
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching song'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse<UpdateSongResponse>> {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
  }

  try {
    // Get the song from database
    const song = await prisma.song.findUnique({
      where: { id: songId }
    })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    // Write metadata to the file
    await writeMetadataToFile(song.filePath, body as SongMetadataUpdate)

    // Separate database fields from file-only fields
    const dbFields = [
      'title',
      'artist',
      'album',
      'albumArtist',
      'year',
      'trackNumber',
      'trackTotal',
      'discNumber',
      'discTotal',
      'genre',
      'composer',
      'comment',
      'lyrics'
    ]

    const dbUpdate: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (dbFields.includes(key)) {
        dbUpdate[key] = value
      }
    }

    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        ...dbUpdate,
        scannedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      song: updatedSong
    })
  } catch (error) {
    console.error('Error updating song metadata:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating song'
      },
      { status: 500 }
    )
  }
}

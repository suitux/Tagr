import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { recordChanges, recordCustomMetadataChanges } from '@/features/history/history.service'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writeMetadataToFile } from '@/features/metadata/metadata-write.service'
import { SongWithMetadata } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

interface UpdateSongSuccessResponse {
  success: true
  song: SongWithMetadata
}

interface UpdateSongErrorResponse {
  success: false
  error: string
}

type UpdateSongResponse = UpdateSongSuccessResponse | UpdateSongErrorResponse

interface GetSongSuccessResponse {
  success: true
  song: SongWithMetadata
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
      where: { id: songId },
      include: { metadata: true }
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
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

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
    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: { metadata: true }
    })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const { customMetadata, ...standardFields } = body as SongMetadataUpdate & {
      customMetadata?: { key: string; value: string | null }[]
    }

    if (Object.keys(standardFields).length > 0) {
      await recordChanges(song, standardFields)
    }

    if (customMetadata) {
      await recordCustomMetadataChanges(songId, song.metadata, customMetadata)
    }

    // Write metadata to the file
    await writeMetadataToFile(song.filePath, { ...standardFields, customMetadata })

    // Re-scan the file to update all metadata in the database (Song, SongMetadata, SongPicture)
    const updatedSong = await rescanSongFileAndSaveIntoDb(songId)

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

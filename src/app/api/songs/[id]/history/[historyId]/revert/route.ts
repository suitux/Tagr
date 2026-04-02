import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { PICTURE_FIELD } from '@/features/history/consts'
import { recordChanges, recordCustomMetadataChanges, recordPictureChange, deserialize, deserializePicture } from '@/features/history/history.service'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writeMetadataToFile, writePictureToFile } from '@/features/metadata/metadata-write.service'
import { SongWithMetadata } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
    historyId: string
  }>
}

interface RevertSuccessResponse {
  success: true
  song: SongWithMetadata
}

interface RevertErrorResponse {
  success: false
  error: string
}

type RevertResponse = RevertSuccessResponse | RevertErrorResponse

export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse<RevertResponse>> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { id, historyId } = await params
  const songId = parseInt(id, 10)
  const changeId = parseInt(historyId, 10)

  if (isNaN(songId) || isNaN(changeId)) {
    return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 })
  }

  try {
    const entry = await prisma.songChangeHistory.findUnique({
      where: { id: changeId }
    })

    if (!entry || entry.songId !== songId) {
      return NextResponse.json({ success: false, error: 'History entry not found' }, { status: 404 })
    }

    const song = await prisma.song.findUnique({
      where: { id: songId },
      include: { metadata: true }
    })
    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    let updatedSong: SongWithMetadata

    if (entry.field === PICTURE_FIELD) {
      await recordPictureChange(songId, entry.oldValue)

      const picture = deserializePicture(entry.oldValue)
      if (picture) {
        await writePictureToFile(song.filePath, picture.buffer, picture.mimeType)
      }
      updatedSong = await rescanSongFileAndSaveIntoDb(songId)
    } else if (entry.field.startsWith('customMetadata:')) {
      const customKey = entry.field.slice('customMetadata:'.length)
      const customMetadata = [{ key: customKey, value: entry.oldValue }]

      await recordCustomMetadataChanges(songId, song.metadata, customMetadata)
      await writeMetadataToFile(song.filePath, { customMetadata })
      updatedSong = await rescanSongFileAndSaveIntoDb(songId)
    } else {
      const revertValue = deserialize(entry.field, entry.oldValue)
      const update = { [entry.field]: revertValue }

      await recordChanges(song, update)

      await writeMetadataToFile(song.filePath, update as SongMetadataUpdate)
      updatedSong = await rescanSongFileAndSaveIntoDb(songId)
    }

    return NextResponse.json({ success: true, song: updatedSong })
  } catch (error) {
    console.error('Error reverting change:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

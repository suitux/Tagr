import { NextResponse } from 'next/server'
import { recordChanges, deserialize } from '@/features/history/history.service'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writeMetadataToFile } from '@/features/metadata/metadata-write.service'
import { Song } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
    historyId: string
  }>
}

interface RevertSuccessResponse {
  success: true
  song: Song
}

interface RevertErrorResponse {
  success: false
  error: string
}

type RevertResponse = RevertSuccessResponse | RevertErrorResponse

export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse<RevertResponse>> {
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

    const song = await prisma.song.findUnique({ where: { id: songId } })
    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const revertValue = deserialize(entry.field, entry.oldValue)
    const update = { [entry.field]: revertValue }

    // Record the revert as a new change
    await recordChanges(song, update)

    // Write to file and rescan
    await writeMetadataToFile(song.filePath, update as SongMetadataUpdate)
    const updatedSong = await rescanSongFileAndSaveIntoDb(songId)

    return NextResponse.json({ success: true, song: updatedSong })
  } catch (error) {
    console.error('Error reverting change:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

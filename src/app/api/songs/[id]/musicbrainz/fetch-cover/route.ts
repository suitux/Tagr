import { NextResponse } from 'next/server'
import { recordPictureChange } from '@/features/history/history.service'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { searchReleaseId, fetchCoverArt } from '@/features/musicbrainz/musicbrainz.service'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { requireRole } from '@/lib/api/auth-guard'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { releaseId?: string }

    const song = await prisma.song.findUnique({ where: { id: songId } })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    let releaseId = body.releaseId

    if (!releaseId) {
      const artist = song.albumArtist || song.artist
      const album = song.album

      if (!artist || !album) {
        return NextResponse.json({ success: false, error: 'Song must have artist and album metadata' }, { status: 400 })
      }

      releaseId = (await searchReleaseId(artist, album)) ?? undefined
    }

    if (!releaseId) {
      return NextResponse.json({ success: false, error: 'No release found on MusicBrainz' }, { status: 404 })
    }

    const cover = await fetchCoverArt(releaseId)
    if (!cover) {
      return NextResponse.json({ success: false, error: 'No cover art found' }, { status: 404 })
    }

    const newPictureData = `data:${cover.contentType};base64,${cover.buffer.toString('base64')}`
    await recordPictureChange(songId, newPictureData, guard.session.user?.name ?? undefined)
    await writePictureToFile(song.filePath, cover.buffer, cover.contentType)
    const updatedSong = await rescanSongFileAndSaveIntoDb(songId)

    return NextResponse.json({ success: true, song: updatedSong })
  } catch (error) {
    console.error('Error fetching MusicBrainz cover:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

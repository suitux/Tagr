import { NextResponse } from 'next/server'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { searchRelease, fetchCoverArt } from '@/features/musicbrainz/musicbrainz.service'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await prisma.song.findUnique({ where: { id: songId } })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const artist = song.albumArtist || song.artist
    const album = song.album

    if (!artist || !album) {
      return NextResponse.json({ success: false, error: 'Song must have artist and album metadata' }, { status: 400 })
    }

    const releaseId = await searchRelease(artist, album)
    if (!releaseId) {
      return NextResponse.json({ success: false, error: 'No release found on MusicBrainz' }, { status: 404 })
    }

    const cover = await fetchCoverArt(releaseId)
    if (!cover) {
      return NextResponse.json({ success: false, error: 'No cover art found' }, { status: 404 })
    }

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

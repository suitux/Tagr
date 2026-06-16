import { NextResponse } from 'next/server'
import { computePeaks } from '@/features/peaks/peaks.service'
import { findSongForPeaks, updateSongPeaks } from '@/features/songs/songs.repository'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await findSongForPeaks(songId)

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    if (song.peaks) {
      return NextResponse.json(
        { success: true, peaks: JSON.parse(song.peaks), duration: song.duration },
        { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
      )
    }

    const peaks = await computePeaks(song.filePath)

    await updateSongPeaks(songId, JSON.stringify(peaks))

    return NextResponse.json(
      { success: true, peaks, duration: song.duration },
      { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
    )
  } catch (error) {
    console.error('Error computing peaks:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

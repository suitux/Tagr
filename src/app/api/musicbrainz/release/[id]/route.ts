import { NextRequest, NextResponse } from 'next/server'
import type { MusicBrainzRecording } from '@/features/musicbrainz/domain'
import { fetchReleaseDetails, mapToSongMetadata } from '@/features/musicbrainz/musicbrainz.service'
import { getSearchParam } from '@/lib/api/search-params'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: releaseId } = await params
  const { searchParams } = request.nextUrl
  const recordingId = getSearchParam(searchParams, 'recordingId', 'string', '')

  if (!releaseId) {
    return NextResponse.json({ success: false, error: 'Release ID is required' }, { status: 400 })
  }

  try {
    const release = await fetchReleaseDetails(releaseId)

    const recording: MusicBrainzRecording = {
      id: recordingId,
      title: '',
      score: 0
    }

    if (release.media) {
      for (const medium of release.media) {
        const track = medium.tracks?.find(t => t.recording.id === recordingId)
        if (track) {
          recording.title = track.title
          break
        }
      }
    }

    const mapped = mapToSongMetadata(recording, release, recordingId)

    return NextResponse.json({ success: true, release, mapped })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch release details' }, { status: 502 })
  }
}

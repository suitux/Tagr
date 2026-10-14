import { NextResponse } from 'next/server'
import { fetchReleaseDetails, mapReleaseTracks } from '@/features/musicbrainz/musicbrainz.service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: releaseId } = await params

  if (!releaseId) {
    return NextResponse.json({ success: false, error: 'Release ID is required' }, { status: 400 })
  }

  try {
    const release = await fetchReleaseDetails(releaseId)

    return NextResponse.json({
      success: true,
      release: {
        id: release.id,
        title: release.title,
        date: release.date,
        country: release.country,
        mediaCount: release.media?.length ?? 0
      },
      tracks: mapReleaseTracks(release)
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch release details' }, { status: 502 })
  }
}

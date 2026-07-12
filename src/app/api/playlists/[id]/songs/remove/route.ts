import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findPlaylistById, removeSongsFromPlaylist } from '@/features/playlists/playlists.repository'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { type BulkTarget } from '@/features/songs/bulk-target'

interface RemoveResponse {
  success: true
  removed: number
}

interface ErrorResponse {
  success: false
  error: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<RemoveResponse | ErrorResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const numericId = Number(id)
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid playlist ID' }, { status: 400 })
  }

  const playlist = await findPlaylistById(numericId)
  if (!playlist) {
    return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
  }
  if (playlist.userId !== userId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { target } = body as { target?: BulkTarget }
    if (!target) {
      return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
    }

    const songIds = await resolveBulkTargetIds(target, { userId })
    const removed = await removeSongsFromPlaylist(numericId, songIds)

    return NextResponse.json({ success: true, removed })
  } catch (error) {
    if (error instanceof BulkResolveError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status })
    }
    console.error('Error removing songs from playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

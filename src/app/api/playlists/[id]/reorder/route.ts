import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findPlaylistById, reorderPlaylistItems } from '@/features/playlists/playlists.repository'

interface OkResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<OkResponse | ErrorResponse>> {
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

  try {
    const playlist = await findPlaylistById(numericId)
    if (!playlist) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (playlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { orderedSongIds } = body as { orderedSongIds?: unknown }
    if (!Array.isArray(orderedSongIds) || orderedSongIds.some(v => typeof v !== 'number')) {
      return NextResponse.json({ success: false, error: 'Invalid orderedSongIds' }, { status: 400 })
    }

    await reorderPlaylistItems(numericId, orderedSongIds as number[])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

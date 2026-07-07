import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findPlaylistById, removeSongFromPlaylist } from '@/features/playlists/playlists.repository'

interface DeleteResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; songId: string }> }
): Promise<NextResponse<DeleteResponse | ErrorResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id, songId } = await params
  const numericId = Number(id)
  const numericSongId = Number(songId)
  if (Number.isNaN(numericId) || Number.isNaN(numericSongId)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const playlist = await findPlaylistById(numericId)
    if (!playlist) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (playlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    await removeSongFromPlaylist(numericId, numericSongId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing song from playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

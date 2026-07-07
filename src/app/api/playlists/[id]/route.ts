import { NextResponse } from 'next/server'
import { createPlaylistObject } from '@/features/playlists/helpers'
import { auth } from '@/auth'
import { type Playlist } from '@/features/playlists/domain'
import { deletePlaylist, findPlaylistById, updatePlaylist } from '@/features/playlists/playlists.repository'

interface GetResponse {
  success: true
  playlist: Playlist
}

interface UpdateResponse {
  success: true
  playlist: Playlist
}

interface DeleteResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetResponse | ErrorResponse>> {
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
    if (playlist.userId !== userId && !playlist.isPublic) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: true, playlist: createPlaylistObject(playlist, userId) })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpdateResponse | ErrorResponse>> {
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
    const existing = await findPlaylistById(numericId)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, isPublic } = body as { name?: unknown; isPublic?: unknown }

    const data: { name?: string; isPublic?: boolean } = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ success: false, error: 'Name must be non-empty' }, { status: 400 })
      }
      data.name = name.trim()
    }
    if (isPublic !== undefined) {
      data.isPublic = Boolean(isPublic)
    }

    const updated = await updatePlaylist(numericId, data)
    return NextResponse.json({ success: true, playlist: createPlaylistObject(updated, userId) })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteResponse | ErrorResponse>> {
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
    const existing = await findPlaylistById(numericId)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    await deletePlaylist(numericId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

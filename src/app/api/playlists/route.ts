import { NextResponse } from 'next/server'
import { createPlaylistObject } from '@/features/playlists/helpers'
import { auth } from '@/auth'
import type { Playlist } from '@/features/playlists/domain'
import { createPlaylist, listPlaylistsByUser, listPublicPlaylists } from '@/features/playlists/playlists.repository'

interface ListResponse {
  success: true
  private: Playlist[]
  public: Playlist[]
}

interface CreateResponse {
  success: true
  playlist: Playlist
}

interface ErrorResponse {
  success: false
  error: string
}

export async function GET(): Promise<NextResponse<ListResponse | ErrorResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [own, publicOnes] = await Promise.all([listPlaylistsByUser(userId), listPublicPlaylists(userId)])

    return NextResponse.json({
      success: true,
      private: own.map(p => createPlaylistObject(p, userId)),
      public: publicOnes.map(p => createPlaylistObject(p, userId))
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request): Promise<NextResponse<CreateResponse | ErrorResponse>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, isPublic } = body as { name?: unknown; isPublic?: unknown }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const created = await createPlaylist({
      userId,
      name: name.trim(),
      isPublic: Boolean(isPublic)
    })

    return NextResponse.json({ success: true, playlist: createPlaylistObject(created, userId) })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

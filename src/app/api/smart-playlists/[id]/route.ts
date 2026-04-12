import { NextResponse } from 'next/server'
import { createSmartPlaylistObject } from '@/app/api/smart-playlists/helpers'
import { auth } from '@/auth'
import { parseSmartListRules, type SmartPlaylist } from '@/features/smart-playlists/domain'
import { smartPlaylistRulesSchema } from '@/features/smart-playlists/rules-schema'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface GetResponse {
  success: true
  playlist: SmartPlaylist
}

interface UpdateResponse {
  success: true
  playlist: SmartPlaylist
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
    const playlist = await prisma.smartPlaylist.findUnique({ where: { id: numericId } })
    if (!playlist) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (playlist.userId !== userId && !playlist.isPublic) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ success: true, playlist: createSmartPlaylistObject(playlist, userId) })
  } catch (error) {
    console.error('Error fetching smart playlist:', error)
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
    const existing = await prisma.smartPlaylist.findUnique({ where: { id: numericId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, rules, isPublic } = body as { name?: unknown; rules?: unknown; isPublic?: unknown }

    const data: { name?: string; rules?: string; isPublic?: boolean } = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ success: false, error: 'Name must be non-empty' }, { status: 400 })
      }
      data.name = name.trim()
    }
    if (rules !== undefined) {
      const rulesResult = smartPlaylistRulesSchema.safeParse(rules)
      if (!rulesResult.success) {
        return NextResponse.json({ success: false, error: 'Invalid rules' }, { status: 400 })
      }
      data.rules = JSON.stringify(rules)
    }
    if (isPublic !== undefined) {
      data.isPublic = Boolean(isPublic)
    }

    const updated = await prisma.smartPlaylist.update({ where: { id: numericId }, data })
    return NextResponse.json({ success: true, playlist: createSmartPlaylistObject(updated, userId) })
  } catch (error) {
    console.error('Error updating smart playlist:', error)
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
    const existing = await prisma.smartPlaylist.findUnique({ where: { id: numericId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    await prisma.smartPlaylist.delete({ where: { id: numericId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting smart playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

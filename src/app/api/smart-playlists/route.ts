import { NextResponse } from 'next/server'
import { createSmartPlaylistObject } from '@/app/api/smart-playlists/helpers'
import { auth } from '@/auth'
import { isValidRules, type SmartPlaylist } from '@/features/smart-playlists/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface ListResponse {
  success: true
  private: SmartPlaylist[]
  public: SmartPlaylist[]
}

interface CreateResponse {
  success: true
  playlist: SmartPlaylist
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
    const [own, publicOnes] = await Promise.all([
      prisma.smartPlaylist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.smartPlaylist.findMany({
        where: { isPublic: true, NOT: { userId } },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      success: true,
      private: own.map(p => createSmartPlaylistObject(p, userId)),
      public: publicOnes.map(p => createSmartPlaylistObject(p, userId))
    })
  } catch (error) {
    console.error('Error fetching smart playlists:', error)
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
    const { name, rules, isPublic } = body as { name?: unknown; rules?: unknown; isPublic?: unknown }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }
    if (!isValidRules(rules)) {
      return NextResponse.json({ success: false, error: 'Invalid rules' }, { status: 400 })
    }
    if (rules.rules.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one rule is required' }, { status: 400 })
    }

    const created = await prisma.smartPlaylist.create({
      data: {
        userId,
        name: name.trim(),
        rules: JSON.stringify(rules),
        isPublic: Boolean(isPublic)
      }
    })

    return NextResponse.json({ success: true, playlist: createSmartPlaylistObject(created, userId) })
  } catch (error) {
    console.error('Error creating smart playlist:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

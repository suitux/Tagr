import { NextRequest, NextResponse } from 'next/server'
import { SongChangeHistoryEntry } from '@/features/history/domain'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { getSearchParam } from '@/lib/api/search-params'

interface HistorySuccessResponse {
  success: true
  entries: SongChangeHistoryEntry[]
  nextCursor: number | null
}

interface HistoryErrorResponse {
  success: false
  error: string
}

type HistoryResponse = HistorySuccessResponse | HistoryErrorResponse

export async function GET(request: NextRequest): Promise<NextResponse<HistoryResponse>> {
  try {
    const { searchParams } = request.nextUrl
    const cursor = getSearchParam(searchParams, 'cursor', 'string')
    const limit = Math.min(getSearchParam(searchParams, 'limit', 'number', 50)!, 100)
    const search = getSearchParam(searchParams, 'search', 'string')
    const songId = getSearchParam(searchParams, 'songId', 'number')

    const where: Prisma.SongChangeHistoryWhereInput = {}
    if (songId) where.songId = songId
    if (search) {
      where.song = { OR: [{ title: { contains: search } }, { artist: { contains: search } }] }
    }

    const cursorId = cursor ? parseInt(cursor, 10) : null

    const entries = await prisma.songChangeHistory.findMany({
      take: limit + 1,
      ...(cursorId && {
        cursor: { id: cursorId },
        skip: 1
      }),
      orderBy: { id: 'desc' },
      where,
      include: {
        song: {
          select: { title: true, artist: true }
        }
      }
    })

    const hasMore = entries.length > limit
    const results = hasMore ? entries.slice(0, limit) : entries

    return NextResponse.json({
      success: true,
      entries: results.map(e => ({
        id: e.id,
        songId: e.songId,
        field: e.field,
        oldValue: e.oldValue,
        newValue: e.newValue,
        changedAt: e.changedAt.toISOString(),
        songTitle: e.song.title,
        songArtist: e.song.artist
      })),
      nextCursor: hasMore ? results[results.length - 1].id : null
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

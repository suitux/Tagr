import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/prisma/dbClient'

const MIN_EXPIRES = 300 // 5 minutes
const MAX_EXPIRES = 2592000 // 30 days

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songId, expiresInSeconds } = body

    if (!songId || typeof songId !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid songId' }, { status: 400 })
    }

    if (!expiresInSeconds || typeof expiresInSeconds !== 'number' || expiresInSeconds < MIN_EXPIRES || expiresInSeconds > MAX_EXPIRES) {
      return NextResponse.json({ success: false, error: `expiresInSeconds must be between ${MIN_EXPIRES} and ${MAX_EXPIRES}` }, { status: 400 })
    }

    const song = await prisma.song.findUnique({ where: { id: songId } })
    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

    const sharedLink = await prisma.sharedLink.create({
      data: { token, songId, expiresAt }
    })

    // Opportunistic cleanup of expired links
    prisma.sharedLink.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      share: {
        token: sharedLink.token,
        expiresAt: sharedLink.expiresAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.wma': 'audio/x-ms-wma',
  '.aiff': 'audio/aiff'
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { filePath: true, extension: true }
    })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    if (!fs.existsSync(song.filePath)) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 })
    }

    const stat = fs.statSync(song.filePath)
    const fileSize = stat.size
    const ext = path.extname(song.filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (!match) {
        return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } })
      }

      const start = parseInt(match[1], 10)
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } })
      }

      const chunkSize = end - start + 1
      const stream = fs.createReadStream(song.filePath, { start, end })

      // @ts-expect-error Node ReadStream is compatible with Web ReadableStream for NextResponse
      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType
        }
      })
    }

    const stream = fs.createReadStream(song.filePath)

    // @ts-expect-error Node ReadStream is compatible with Web ReadableStream for NextResponse
    return new NextResponse(stream, {
      headers: {
        'Content-Length': String(fileSize),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      }
    })
  } catch (error) {
    console.error('Error streaming audio:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

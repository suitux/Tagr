import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { MIME_TYPES } from '@/features/songs/domain'

export function streamAudioFile(filePath: string, rangeHeader: string | null): NextResponse {
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

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
    const stream = fs.createReadStream(filePath, { start, end })

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

  const stream = fs.createReadStream(filePath)

  // @ts-expect-error Node ReadStream is compatible with Web ReadableStream for NextResponse
  return new NextResponse(stream, {
    headers: {
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    }
  })
}

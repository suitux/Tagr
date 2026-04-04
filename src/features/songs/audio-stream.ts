import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { NextResponse } from 'next/server'
import { MIME_TYPES } from '@/features/songs/domain'

function nodeStreamToWeb(nodeStream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk))
      })
      nodeStream.on('end', () => {
        controller.close()
      })
      nodeStream.on('error', (err) => {
        controller.error(err)
      })
    },
    cancel() {
      nodeStream.destroy()
    }
  })
}

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
    const MAX_CHUNK = 1024 * 1024 // 1MB chunks for progressive playback
    const end = match[2] ? parseInt(match[2], 10) : Math.min(start + MAX_CHUNK - 1, fileSize - 1)

    if (start >= fileSize || end >= fileSize) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } })
    }

    const chunkSize = end - start + 1
    const stream = fs.createReadStream(filePath, { start, end })

    return new NextResponse(nodeStreamToWeb(stream), {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600'
      }
    })
  }

  const stream = fs.createReadStream(filePath)

  return new NextResponse(nodeStreamToWeb(stream), {
    headers: {
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600'
    }
  })
}

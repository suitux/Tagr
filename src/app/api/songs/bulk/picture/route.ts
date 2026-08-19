import { NextResponse } from 'next/server'
import { recordPictureChange } from '@/features/history/history.service'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { MAX_COVER_IMAGE_BYTES, type SongWithMetadata } from '@/features/songs/domain'
import { findSongById } from '@/features/songs/songs.repository'
import { requireRole } from '@/lib/api/auth-guard'
import { ndjsonStreamResponse, type NdjsonEvent } from '@/lib/ndjson-stream'

export type BulkPictureResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

export async function POST(request: Request): Promise<Response> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid multipart body' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Uploaded file is not an image' }, { status: 400 })
  }

  if (file.size > MAX_COVER_IMAGE_BYTES) {
    return NextResponse.json({ success: false, error: 'Image is too large (max 20MB)' }, { status: 400 })
  }

  const rawTarget = formData.get('target')
  if (typeof rawTarget !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
  }

  let target: BulkTarget
  try {
    target = JSON.parse(rawTarget) as BulkTarget
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid target' }, { status: 400 })
  }

  let songIds: number[]
  try {
    songIds = await resolveBulkTargetIds(target, { userId: guard.session.user?.id })
  } catch (e) {
    if (e instanceof BulkResolveError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status })
    }
    throw e
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const pictureData = `data:${file.type};base64,${buffer.toString('base64')}`
  const changedBy = guard.session.user?.name ?? undefined

  return ndjsonStreamResponse<BulkPictureResult>(async function* () {
    yield { type: 'start', total: songIds.length } satisfies NdjsonEvent<BulkPictureResult>

    for (let i = 0; i < songIds.length; i++) {
      const songId = songIds[i]
      let entry: BulkPictureResult

      try {
        const song = await findSongById(songId)
        if (!song) {
          entry = { songId, ok: false, error: 'Song not found' }
        } else {
          await recordPictureChange(songId, pictureData, changedBy)
          await writePictureToFile(song.filePath, buffer, file.type)
          const updated = await rescanSongFileAndSaveIntoDb(songId)
          entry = { songId, ok: true, song: updated }
        }
      } catch (e) {
        console.error(`Bulk picture update failed for song ${songId}:`, e)
        entry = { songId, ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }

      yield { type: 'result', index: i, result: entry }
    }

    yield { type: 'done', resolvedCount: songIds.length }
  })
}

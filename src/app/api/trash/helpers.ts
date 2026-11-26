import { NextResponse } from 'next/server'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { TrashError, type TrashOperationResult } from '@/features/trash/domain'
import { ndjsonStreamResponse, type NdjsonEvent } from '@/lib/ndjson-stream'

interface TrashOperationOptions {
  userId?: string
  /** The songs to act on when the body names no target (e.g. "empty the trash"). */
  fallbackIds?: () => Promise<number[]>
  /** Runs once every song has been handled, before the stream closes. */
  after?: () => Promise<unknown>
}

/** Resolves the body's bulk target and streams one NDJSON result per song, like `/api/songs/bulk`. */
export async function streamTrashOperation(
  request: Request,
  operation: (songId: number) => Promise<unknown>,
  { userId, fallbackIds, after }: TrashOperationOptions = {}
): Promise<Response> {
  let body: { target?: BulkTarget } = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text)
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  let songIds: number[]
  try {
    if (body?.target) {
      songIds = await resolveBulkTargetIds(body.target, { userId, unlimited: true })
    } else if (fallbackIds) {
      songIds = await fallbackIds()
    } else {
      return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
    }
  } catch (e) {
    if (e instanceof BulkResolveError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status })
    }
    throw e
  }

  return ndjsonStreamResponse<TrashOperationResult>(async function* () {
    yield { type: 'start', total: songIds.length } satisfies NdjsonEvent<TrashOperationResult>

    for (let i = 0; i < songIds.length; i++) {
      const songId = songIds[i]
      let result: TrashOperationResult
      try {
        await operation(songId)
        result = { songId, ok: true }
      } catch (e) {
        if (e instanceof TrashError) {
          result = { songId, ok: false, code: e.code, error: e.message, fileName: e.fileName }
        } else {
          console.error(`Trash operation failed for song ${songId}:`, e)
          result = { songId, ok: false, code: 'unknown', error: e instanceof Error ? e.message : 'Unknown error' }
        }
      }

      yield { type: 'result', index: i, result }
    }

    await after?.()

    yield { type: 'done', resolvedCount: songIds.length }
  })
}

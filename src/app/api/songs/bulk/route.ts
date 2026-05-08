import { NextResponse } from 'next/server'
import { recordChanges, recordCustomMetadataChanges } from '@/features/history/history.service'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writeMetadataToFile } from '@/features/metadata/metadata-write.service'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { requireRole } from '@/lib/api/auth-guard'
import { ndjsonStreamResponse, type NdjsonEvent } from '@/lib/ndjson-stream'

interface BulkUpdateBody {
  target: BulkTarget
  metadata?: Partial<SongMetadataUpdate>
  customMetadata?: { key: string; value: string | null }[]
}

export type BulkUpdateResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

export async function PATCH(request: Request): Promise<Response> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  let body: BulkUpdateBody
  try {
    body = (await request.json()) as BulkUpdateBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !body.target) {
    return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
  }

  const standardFields = (body.metadata ?? {}) as SongMetadataUpdate
  const customMetadata = body.customMetadata
  const hasStandardFields = Object.keys(standardFields).length > 0
  const hasCustom = Array.isArray(customMetadata) && customMetadata.length > 0

  if (!hasStandardFields && !hasCustom) {
    return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
  }

  let songIds: number[]
  try {
    songIds = await resolveBulkTargetIds(body.target, { userId: guard.session.user?.id })
  } catch (e) {
    if (e instanceof BulkResolveError) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status })
    }
    throw e
  }

  const changedBy = guard.session.user?.name ?? undefined

  return ndjsonStreamResponse<BulkUpdateResult>(async function* () {
    yield { type: 'start', total: songIds.length } satisfies NdjsonEvent<BulkUpdateResult>

    for (let i = 0; i < songIds.length; i++) {
      const songId = songIds[i]
      let entry: BulkUpdateResult
      try {
        const song = await prisma.song.findUnique({ where: { id: songId }, include: { metadata: true } })
        if (!song) {
          entry = { songId, ok: false, error: 'Song not found' }
        } else {
          if (hasStandardFields) {
            await recordChanges(song, standardFields as Record<string, unknown>, changedBy)
          }
          if (hasCustom) {
            await recordCustomMetadataChanges(songId, song.metadata, customMetadata!, changedBy)
          }
          await writeMetadataToFile(song.filePath, {
            ...standardFields,
            ...(hasCustom && { customMetadata })
          })
          const updated = await rescanSongFileAndSaveIntoDb(songId)
          entry = { songId, ok: true, song: updated }
        }
      } catch (e) {
        console.error(`Bulk update failed for song ${songId}:`, e)
        entry = { songId, ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }

      yield { type: 'result', index: i, result: entry }
    }

    yield { type: 'done', resolvedCount: songIds.length }
  })
}

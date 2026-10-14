import { NextResponse } from 'next/server'
import { recordChanges, recordPictureChange } from '@/features/history/history.service'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writeMetadataToFile, writePictureToFile } from '@/features/metadata/metadata-write.service'
import { isValidApplyItems, type BulkMusicBrainzApplyItem } from '@/features/musicbrainz/bulk-lookup'
import { BULK_MUSICBRAINZ_LIMIT } from '@/features/musicbrainz/domain'
import { fetchCoverArt } from '@/features/musicbrainz/musicbrainz.service'
import { type SongWithMetadata } from '@/features/songs/domain'
import { findSongWithMetadata } from '@/features/songs/songs.repository'
import { requireRole } from '@/lib/api/auth-guard'
import { ndjsonStreamResponse, type NdjsonEvent } from '@/lib/ndjson-stream'

interface BulkMusicBrainzApplyBody {
  items: BulkMusicBrainzApplyItem[]
  /** When set, the front cover of this release is written to every song as well. */
  coverReleaseId?: string
}

export type BulkMusicBrainzApplyResult =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

/**
 * Writes what the bulk lookup matched: each song gets its own track's tags, so unlike the plain bulk
 * edit the metadata differs per song. The cover is fetched once and written to all of them.
 */
export async function PATCH(request: Request): Promise<Response> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  let body: BulkMusicBrainzApplyBody
  try {
    body = (await request.json()) as BulkMusicBrainzApplyBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || !isValidApplyItems(body.items) || body.items.length > BULK_MUSICBRAINZ_LIMIT) {
    return NextResponse.json({ success: false, error: 'Invalid items' }, { status: 400 })
  }

  let cover: Awaited<ReturnType<typeof fetchCoverArt>> = null
  if (body.coverReleaseId) {
    cover = await fetchCoverArt(body.coverReleaseId)
    if (!cover) {
      return NextResponse.json({ success: false, error: 'No cover art found' }, { status: 404 })
    }
  }

  const items = body.items
  const changedBy = guard.session.user?.name ?? undefined
  const pictureData = cover ? `data:${cover.contentType};base64,${cover.buffer.toString('base64')}` : null

  return ndjsonStreamResponse<BulkMusicBrainzApplyResult>(async function* () {
    yield { type: 'start', total: items.length } satisfies NdjsonEvent<BulkMusicBrainzApplyResult>

    for (let i = 0; i < items.length; i++) {
      const { songId, metadata } = items[i]
      let entry: BulkMusicBrainzApplyResult

      try {
        const song = await findSongWithMetadata(songId)
        if (!song) {
          entry = { songId, ok: false, error: 'Song not found' }
        } else {
          const fields = metadata as SongMetadataUpdate
          if (Object.keys(fields).length > 0) {
            await recordChanges(song, fields as Record<string, unknown>, changedBy)
            await writeMetadataToFile(song.filePath, fields)
          }
          if (cover && pictureData) {
            await recordPictureChange(songId, pictureData, changedBy)
            await writePictureToFile(song.filePath, cover.buffer, cover.contentType)
          }
          entry = { songId, ok: true, song: await rescanSongFileAndSaveIntoDb(songId) }
        }
      } catch (e) {
        console.error(`Bulk MusicBrainz apply failed for song ${songId}:`, e)
        entry = { songId, ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }

      yield { type: 'result', index: i, result: entry }
    }

    yield { type: 'done', resolvedCount: items.length }
  })
}

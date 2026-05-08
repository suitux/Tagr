import { NextResponse } from 'next/server'
import { recordPictureChange } from '@/features/history/history.service'
import { BulkResolveError, resolveBulkTargetIds } from '@/features/metadata/bulk-resolver.service'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { fetchCoverArt, searchReleaseId } from '@/features/musicbrainz/musicbrainz.service'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { prisma } from '@/infrastructure/prisma/dbClient'
import { requireRole } from '@/lib/api/auth-guard'

interface BulkCoverBody {
  target: BulkTarget
}

type ResultEntry =
  | { songId: number; ok: true; song: SongWithMetadata }
  | { songId: number; ok: false; error: string }

interface SuccessResponse {
  success: true
  resolvedCount: number
  results: ResultEntry[]
}

interface ErrorResponse {
  success: false
  error: string
}

type Response = SuccessResponse | ErrorResponse

const MB_RATE_LIMIT_DELAY_MS = 1100

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request): Promise<NextResponse<Response>> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  let body: BulkCoverBody
  try {
    body = (await request.json()) as BulkCoverBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !body.target) {
    return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 })
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
  const results: ResultEntry[] = []

  for (let i = 0; i < songIds.length; i++) {
    const songId = songIds[i]
    try {
      if (i > 0) await sleep(MB_RATE_LIMIT_DELAY_MS)

      const song = await prisma.song.findUnique({ where: { id: songId } })
      if (!song) {
        results.push({ songId, ok: false, error: 'Song not found' })
        continue
      }

      const artist = song.albumArtist || song.artist
      const album = song.album

      if (!artist || !album) {
        results.push({ songId, ok: false, error: 'Song must have artist and album metadata' })
        continue
      }

      const releaseId = await searchReleaseId(artist, album)
      if (!releaseId) {
        results.push({ songId, ok: false, error: 'No release found on MusicBrainz' })
        continue
      }

      const cover = await fetchCoverArt(releaseId)
      if (!cover) {
        results.push({ songId, ok: false, error: 'No cover art found' })
        continue
      }

      const newPictureData = `data:${cover.contentType};base64,${cover.buffer.toString('base64')}`
      await recordPictureChange(songId, newPictureData, changedBy)
      await writePictureToFile(song.filePath, cover.buffer, cover.contentType)
      const updated = await rescanSongFileAndSaveIntoDb(songId)
      results.push({ songId, ok: true, song: updated })
    } catch (e) {
      console.error(`Bulk MusicBrainz cover failed for song ${songId}:`, e)
      results.push({
        songId,
        ok: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      })
    }
  }

  return NextResponse.json({ success: true, resolvedCount: songIds.length, results })
}

import { NextResponse } from 'next/server'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'
import { writePictureToFile } from '@/features/metadata/metadata-write.service'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface RouteParams {
  params: Promise<{ id: string }>
}

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2'
const COVERART_API = 'https://coverartarchive.org'
const USER_AGENT = 'Tagr/1.0.0 (https://github.com/suitux/tagr)'

interface MusicBrainzRelease {
  id: string
  title: string
  score: number
}

interface MusicBrainzSearchResponse {
  releases: MusicBrainzRelease[]
}

interface CoverArtImage {
  front: boolean
  image: string
  thumbnails: {
    small?: string
    large?: string
    250?: string
    500?: string
    1200?: string
  }
}

interface CoverArtResponse {
  images: CoverArtImage[]
}

async function searchRelease(artist: string, album: string): Promise<string | null> {
  const query = `release:${JSON.stringify(album)} AND artist:${JSON.stringify(artist)}`
  const url = `${MUSICBRAINZ_API}/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) return null

  const data = (await response.json()) as MusicBrainzSearchResponse
  if (!data.releases?.length) return null

  return data.releases[0].id
}

async function fetchCoverArt(releaseId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const url = `${COVERART_API}/release/${releaseId}`

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!response.ok) return null

  const data = (await response.json()) as CoverArtResponse
  const front = data.images?.find(img => img.front)
  if (!front) return null

  const imageUrl = front.thumbnails['500'] ?? front.thumbnails.large ?? front.image
  const imageResponse = await fetch(imageUrl, {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!imageResponse.ok) return null

  const arrayBuffer = await imageResponse.arrayBuffer()
  const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg'

  return { buffer: Buffer.from(arrayBuffer), contentType }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await prisma.song.findUnique({ where: { id: songId } })

    if (!song) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    const artist = song.albumArtist || song.artist
    const album = song.album

    if (!artist || !album) {
      return NextResponse.json({ success: false, error: 'Song must have artist and album metadata' }, { status: 400 })
    }

    const releaseId = await searchRelease(artist, album)
    if (!releaseId) {
      return NextResponse.json({ success: false, error: 'No release found on MusicBrainz' }, { status: 404 })
    }

    const cover = await fetchCoverArt(releaseId)
    if (!cover) {
      return NextResponse.json({ success: false, error: 'No cover art found' }, { status: 404 })
    }

    await writePictureToFile(song.filePath, cover.buffer, cover.contentType)
    const updatedSong = await rescanSongFileAndSaveIntoDb(songId)

    return NextResponse.json({ success: true, song: updatedSong })
  } catch (error) {
    console.error('Error fetching MusicBrainz cover:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { rescanSongFileAndSaveIntoDb } from '@/features/metadata/metadata-scan.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  const { id } = await params
  const songId = parseInt(id, 10)

  if (isNaN(songId)) {
    return NextResponse.json({ success: false, error: 'Invalid song ID' }, { status: 400 })
  }

  try {
    const song = await rescanSongFileAndSaveIntoDb(songId)
    return NextResponse.json({ success: true, song })
  } catch (error) {
    console.error('Error rescanning song:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error rescanning song' },
      { status: 500 }
    )
  }
}
